/**
 * UXEnhancements — Nielsen's 10 Usability Heuristics
 *
 * Each method maps directly to one of Nielsen's heuristics:
 *
 *  1. Visibility of system status       → showSystemStatus / showLoadingState
 *  2. Match between system & real world → useFamiliarLanguage
 *  3. User control and freedom          → addToHistory / canGoBack / goBack
 *  4. Consistency and standards         → ensureConsistency
 *  5. Error prevention                  → preventErrors
 *  6. Recognition rather than recall    → addTooltips / showContextualHelp
 *  7. Flexibility and efficiency        → setupKeyboardShortcuts
 *  8. Aesthetic and minimalist design   → minimizeUI
 *  9. Error diagnosis and recovery      → showError / createNotification
 * 10. Help and documentation            → toggleHelp / updateHelpContent
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
import type { NotificationType } from '../types/ui';

/** Window extension — exposes core singletons from other modules. */
type GlobalWindow = Window & typeof globalThis & Record<string, unknown>;

/* ================================================================
   Type helpers
   ================================================================ */

/** Resolved UIController type without a runtime import cycle. */
type UIControllerRef = {
  switchProject: (id: string) => boolean;
  reloadCurrentProject: () => void;
};

/** Resolved ProjectManager type without a runtime import cycle. */
type ProjectManagerRef = {
  getAllProjects: () => Array<{ id: string; name: string; description: string }>;
  hasProject: (id: string) => boolean;
};

/* ================================================================
   UXEnhancements
   ================================================================ */

export class UXEnhancements {
  /** Whether the help panel is currently shown. */
  private helpVisible: boolean;

  /** Registered keyboard shortcut handlers (not currently populated externally). */
  private readonly keyboardShortcuts: Map<string, () => void>;

  /** Ordered list of visited project ids for back-navigation (Heuristic 3). */
  private projectHistory: string[];

  /** Current position in `projectHistory`. */
  private historyIndex: number;

  constructor() {
    this.helpVisible       = false;
    this.keyboardShortcuts = new Map<string, () => void>();
    this.projectHistory    = [];
    this.historyIndex      = -1;

    this.setupKeyboardShortcuts();
    this.setupAccessibility();

    /* Defer heuristic DOM work until the document is ready */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', (): void => {
        this.initializeHeuristics();
      });
    } else {
      this.initializeHeuristics();
    }
  }

  /* ================================================================
     Initialisation
     ================================================================ */

  /**
   * Runs the heuristics that require a fully parsed DOM.
   * Called either immediately or deferred to DOMContentLoaded.
   */
  private initializeHeuristics(): void {
    this.useFamiliarLanguage(); // Heuristic 2
    this.ensureConsistency();   // Heuristic 4
    this.preventErrors();       // Heuristic 5
    this.minimizeUI();          // Heuristic 8
  }

  /* ================================================================
     Heuristic 1 — Visibility of system status
     ================================================================ */

  /**
   * Displays a transient status message in the status bar.
   * `'info'` messages auto-hide after 3 seconds; others persist.
   *
   * @param message - Text to show in the status bar
   * @param type    - Visual variant controlling CSS class
   */
  showSystemStatus(message: string, type: NotificationType | 'info' = 'info'): void {
    const statusBar       = this.getOrCreateStatusBar();
    statusBar.textContent = message;
    statusBar.className   = `status-bar status-${type}`;

    if (type === 'info') {
      setTimeout((): void => {
        if (statusBar.textContent === message) {
          statusBar.textContent = '';
          statusBar.className   = 'status-bar';
        }
      }, 3000);
    }
  }

  /**
   * Toggles the `loading` class and `aria-busy` attribute on a DOM element.
   *
   * @param element   - Element to mark as loading (may be null — no-ops safely)
   * @param isLoading - `true` to show loading state, `false` to clear it
   */
  showLoadingState(element: HTMLElement | null, isLoading: boolean): void {
    if (!element) return;

    if (isLoading) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
    } else {
      element.classList.remove('loading');
      element.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Updates the status bar to reflect the currently active project.
   *
   * @param projectName - Display name of the project that just became active
   */
  updateProjectStatus(projectName: string): void {
    this.showSystemStatus(`Current Project: ${projectName}`, 'info');
  }

  /* ================================================================
     Heuristic 2 — Match between system and real world
     ================================================================ */

  /**
   * Ensures every project and control button exposes an `aria-label`
   * so assistive technologies can describe them with plain language.
   */
  private useFamiliarLanguage(): void {
    document.querySelectorAll<HTMLButtonElement>('.project-btn, .control-btn')
      .forEach((btn): void => {
        if (!btn.getAttribute('aria-label') && btn.textContent) {
          btn.setAttribute('aria-label', btn.textContent.trim());
        }
      });
  }

  /* ================================================================
     Heuristic 3 — User control and freedom
     ================================================================ */

  /**
   * Records a project visit in the history stack.
   *
   * Truncates any forward history (visits after the current position)
   * before appending, mimicking standard browser back/forward behaviour.
   * History is capped at 10 entries to bound memory usage.
   *
   * @param projectId - The project id that was just switched to
   */
  addToHistory(projectId: string): void {
    /* Truncate forward history */
    this.projectHistory = this.projectHistory.slice(0, this.historyIndex + 1);

    this.projectHistory.push(projectId);
    this.historyIndex = this.projectHistory.length - 1;

    /* Cap history size */
    if (this.projectHistory.length > 10) {
      this.projectHistory.shift();
      this.historyIndex--;
    }
  }

  /**
   * Returns `true` when the user can navigate to a previous project.
   * Used to enable/disable the back button (Heuristic 5 — error prevention).
   */
  canGoBack(): boolean {
    return this.projectHistory.length > 0 && this.historyIndex > 0;
  }

  /**
   * Navigates back to the previous project in history.
   * Silently skips entries whose projects are no longer registered
   * and retries until it finds a valid one or exhausts the stack.
   */
  goBack(): void {
    if (!this.canGoBack()) {
      this.showSystemStatus('No previous project to return to', 'warning');
      return;
    }

    const pm = (window as GlobalWindow)['projectManager'] as ProjectManagerRef;
    const uc = (window as GlobalWindow)['uiController']  as UIControllerRef;

    this.historyIndex--;
    const previousId = this.projectHistory[this.historyIndex];

    if (previousId && pm.hasProject(previousId)) {
      uc.switchProject(previousId);
      this.showSystemStatus('Returned to previous project', 'info');
    } else {
      /* Project no longer registered — remove stale entry and recurse */
      this.projectHistory.splice(this.historyIndex, 1);
      this.historyIndex--;

      if (this.canGoBack()) {
        this.goBack();
      } else {
        this.showSystemStatus('Previous project no longer available', 'warning');
      }
    }
  }

  /* ================================================================
     Heuristic 4 — Consistency and standards
     ================================================================ */

  /**
   * Guarantees all buttons have a `tabindex` and respond to
   * `Enter` / `Space` — the standard keyboard conventions for activating
   * interactive elements in web UIs.
   */
  private ensureConsistency(): void {
    document.querySelectorAll<HTMLButtonElement>('button').forEach((btn): void => {
      if (!btn.hasAttribute('tabindex')) {
        btn.setAttribute('tabindex', '0');
      }

      btn.addEventListener('keydown', (e: KeyboardEvent): void => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /* ================================================================
     Heuristic 5 — Error prevention
     ================================================================ */

  /**
   * Pre-emptively disables the back button when there is no history,
   * and warns before the user navigates away mid-load.
   */
  private preventErrors(): void {
    const backBtn = document.getElementById('back-btn') as HTMLButtonElement | null;
    if (backBtn) {
      backBtn.disabled = !this.canGoBack();
    }

    window.addEventListener('beforeunload', (e: BeforeUnloadEvent): string | undefined => {
      const wrapper = document.getElementById('canvas-wrapper');
      if (wrapper?.classList.contains('loading')) {
        const msg = 'A project is currently loading. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
      return undefined;
    });
  }

  /**
   * Presents a native confirmation dialog and invokes `callback` only
   * if the user confirms.
   *
   * @param message  - Confirmation prompt shown to the user
   * @param callback - Action to perform if confirmed
   */
  confirmAction(message: string, callback: () => void): void {
    if (confirm(message)) {
      callback();
    }
  }

  /* ================================================================
     Heuristic 6 — Recognition rather than recall
     ================================================================ */

  /**
   * Refreshes `title` and `aria-label` on every `.project-btn` element.
   * Uses `data-project-id` to look up the matching project description
   * from ProjectManager without needing direct access to `uiController.projectButtons`.
   */
  addTooltips(): void {
    const pm = (window as GlobalWindow)['projectManager'] as ProjectManagerRef;

    document.querySelectorAll<HTMLButtonElement>('.project-btn').forEach((btn): void => {
      const projectId = btn.getAttribute('data-project-id');
      if (!projectId) return;

      const project = pm.getAllProjects().find((p): boolean => p.id === projectId);
      if (project) {
        btn.setAttribute('title',      project.description);
        btn.setAttribute('aria-label', `${project.name}: ${project.description}`);
      }
    });
  }

  /**
   * Attaches a transient contextual tooltip to `element`.
   * Auto-removes after 5 seconds.
   *
   * @param element  - The element to which the tooltip is appended
   * @param helpText - Tooltip content
   */
  showContextualHelp(element: HTMLElement, helpText: string): void {
    const tip       = document.createElement('div');
    tip.className   = 'contextual-help';
    tip.textContent = helpText;
    tip.setAttribute('role', 'tooltip');

    element.appendChild(tip);
    setTimeout((): void => { tip.remove(); }, 5000);
  }

  /* ================================================================
     Heuristic 7 — Flexibility and efficiency of use
     ================================================================ */

  /**
   * Registers global keyboard shortcuts:
   * - `1–9`           → switch to nth project (alphabetically)
   * - `ArrowLeft`     → go back
   * - `H`             → toggle help panel
   * - `Escape`        → close help
   * - `Ctrl/Cmd + R`  → reload current project
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement;

      /* Do not intercept keys while the user is typing in a form field */
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const pm = (window as GlobalWindow)['projectManager'] as ProjectManagerRef;
      const uc = (window as GlobalWindow)['uiController']  as UIControllerRef;

      /* Escape — close help panel */
      if (e.key === 'Escape') {
        this.hideHelp();
        return;
      }

      /* 1–9 — switch to nth sorted project */
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const sorted = [...pm.getAllProjects()].sort((a, b): number =>
          a.id.localeCompare(b.id)
        );
        const project = sorted[num - 1];
        if (project) {
          uc.switchProject(project.id);
          this.showSystemStatus(`Switched to ${project.name} (Shortcut: ${num})`, 'info');
        }
        return;
      }

      /* ArrowLeft — go back */
      if (e.key === 'ArrowLeft' && this.canGoBack()) {
        this.goBack();
        return;
      }

      /* H — toggle help */
      if (e.key === 'h' || e.key === 'H') {
        this.toggleHelp();
        return;
      }

      /* Ctrl/Cmd + R — reload current project */
      if ((e.key === 'r' || e.key === 'R') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        uc.reloadCurrentProject();
        this.showSystemStatus('Project reloaded', 'info');
      }
    });
  }

  /* ================================================================
     Heuristic 8 — Aesthetic and minimalist design
     ================================================================ */

  /**
   * Hides empty panels so they do not clutter the layout.
   * The analytics panel is hidden until populated by `EnhancedUIController`.
   */
  private minimizeUI(): void {
    const panel = document.getElementById('analytics-panel');
    if (panel && !panel.textContent?.trim()) {
      panel.style.display = 'none';
    }
  }

  /* ================================================================
     Heuristic 9 — Help users recognize, diagnose, and recover from errors
     ================================================================ */

  /**
   * Displays an error notification with an optional recovery suggestion.
   * Auto-removes after 5 seconds.
   *
   * @param message  - Short description of what went wrong
   * @param recovery - Optional guidance on how to recover
   */
  showError(message: string, recovery?: string): void {
    const notification = this.createNotification('error', message, recovery);
    document.body.appendChild(notification);
    setTimeout((): void => { notification.remove(); }, 5000);
  }

  /**
   * Builds a notification `<div>` with message, optional recovery text, and
   * a close button. Does not attach it to the DOM — callers decide placement.
   *
   * @param type     - Visual variant (`'error' | 'info' | 'success' | 'warning'`)
   * @param message  - Primary notification text
   * @param recovery - Secondary guidance text (omitted if not provided)
   * @returns The constructed notification element
   */
  createNotification(
    type: NotificationType,
    message: string,
    recovery?: string
  ): HTMLDivElement {
    const root = document.createElement('div');
    root.className = `notification notification-${type}`;
    root.setAttribute('role',      'alert');
    root.setAttribute('aria-live', 'polite');

    const msgEl       = document.createElement('div');
    msgEl.className   = 'notification-message';
    msgEl.textContent = message;
    root.appendChild(msgEl);

    if (recovery) {
      const recEl       = document.createElement('div');
      recEl.className   = 'notification-recovery';
      recEl.textContent = recovery;
      root.appendChild(recEl);
    }

    const closeBtn   = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×'; // ×
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.onclick   = (): void => { root.remove(); };
    root.appendChild(closeBtn);

    return root;
  }

  /* ================================================================
     Heuristic 10 — Help and documentation
     ================================================================ */

  /** Toggles the help panel open/closed. */
  toggleHelp(): void {
    this.helpVisible = !this.helpVisible;
    const panel      = this.getOrCreateHelpPanel();

    if (this.helpVisible) {
      panel.classList.add('visible');
      panel.setAttribute('aria-hidden', 'false');
      this.updateHelpContent();
    } else {
      panel.classList.remove('visible');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  /** Closes the help panel without toggling. No-ops if already hidden. */
  hideHelp(): void {
    this.helpVisible = false;
    const panel = document.getElementById('help-panel');
    if (panel) {
      panel.classList.remove('visible');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Re-renders the help panel content with the current project list.
   * Called every time the panel is opened so new projects are always shown.
   */
  updateHelpContent(): void {
    const panel = document.getElementById('help-panel');
    if (!panel) return;

    const pm      = (window as GlobalWindow)['projectManager'] as ProjectManagerRef;
    const sorted  = [...pm.getAllProjects()].sort((a, b): number =>
      a.id.localeCompare(b.id)
    );

    const projectListHtml = sorted
      .map((p, i): string => {
        const shortcut = i < 9 ? `<kbd>${i + 1}</kbd> - ` : '';
        return `<li>${shortcut}${p.name}</li>`;
      })
      .join('');

    const overflowNote = sorted.length > 9
      ? `<p class="help-overflow-note">Projects beyond 9th are accessible via sidebar buttons.</p>`
      : '';

    panel.innerHTML = `
      <div class="help-content">
        <h2 id="help-title">Help &amp; Keyboard Shortcuts</h2>
        <div class="help-section">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><kbd>1-9</kbd> - Switch to project (by sorted order)</li>
            <li><kbd>←</kbd> - Go back to previous project</li>
            <li><kbd>H</kbd> - Toggle this help panel</li>
            <li><kbd>Esc</kbd> - Close help</li>
            <li><kbd>Ctrl/Cmd + R</kbd> - Reload current project</li>
          </ul>
        </div>
        <div class="help-section">
          <h3>Available Projects (${sorted.length} total)</h3>
          <ul>${projectListHtml}</ul>
          ${overflowNote}
        </div>
        <div class="help-section">
          <h3>Tips</h3>
          <ul>
            <li>Click sidebar buttons to switch between projects</li>
            <li>Use the Reload button to restart the current project</li>
            <li>Hover over buttons to see project descriptions</li>
            <li>Each project runs in its own isolated p5.js canvas</li>
            <li>Projects are sorted alphabetically by ID (A1A, A1B, A1C…)</li>
          </ul>
        </div>
        <button class="help-close" onclick="uxEnhancements.hideHelp()">Close Help</button>
      </div>
    `;
  }

  /* ================================================================
     DOM helpers
     ================================================================ */

  /**
   * Returns the existing `#help-panel` element, or creates and appends
   * a new one if none is present.
   */
  getOrCreateHelpPanel(): HTMLDivElement {
    let panel = document.getElementById('help-panel') as HTMLDivElement | null;

    if (!panel) {
      panel = document.createElement('div');
      panel.id        = 'help-panel';
      panel.className = 'help-panel';
      panel.setAttribute('role',             'dialog');
      panel.setAttribute('aria-labelledby',  'help-title');
      panel.setAttribute('aria-hidden',      'true');
      document.body.appendChild(panel);
    }

    return panel;
  }

  /**
   * Returns the existing `#status-bar` element, or creates and appends
   * a new one if none is present.
   */
  getOrCreateStatusBar(): HTMLDivElement {
    let bar = document.getElementById('status-bar') as HTMLDivElement | null;

    if (!bar) {
      bar = document.createElement('div');
      bar.id        = 'status-bar';
      bar.className = 'status-bar';
      bar.setAttribute('role',      'status');
      bar.setAttribute('aria-live', 'polite');
      document.body.appendChild(bar);
    }

    return bar;
  }

  /* ================================================================
     Accessibility
     ================================================================ */

  /**
   * Injects a "Skip to main content" link as the very first child of
   * `<body>` so keyboard users can bypass the sidebar navigation.
   * Deferred to DOMContentLoaded if the document is still parsing.
   */
  private setupAccessibility(): void {
    const inject = (): void => {
      const skip       = document.createElement('a');
      skip.href        = '#main-content';
      skip.className   = 'skip-link';
      skip.textContent = 'Skip to main content';
      skip.setAttribute('aria-label', 'Skip to main content');

      if (document.body.firstChild) {
        document.body.insertBefore(skip, document.body.firstChild);
      } else {
        document.body.appendChild(skip);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }
}

/* ================================================================
   Global singleton
   ================================================================ */
export const uxEnhancements = new UXEnhancements();
(window as GlobalWindow)['uxEnhancements'] = uxEnhancements;

/**
 * UIController — User Interface Management
 *
 * Manages the project selection sidebar, canvas visibility, and the
 * control-panel buttons (Reload / Fullscreen).
 *
 * Interacts with the global `projectManager` and `uxEnhancements` instances
 * that are assigned to `window` by their respective modules.
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
import type { IProject } from '../types/project';

/** Window extension — core globals assigned by other modules. */
type GlobalWindow = Window & typeof globalThis & Record<string, unknown>;

/** Known project registry entry for lazy-loading fallback. */
interface IExpectedProject {
  id: string;
  name: string;
  /** Relative script path used if the project isn't registered yet. */
  path: string;
}

export class UIController {
  /** Map of project id → sidebar button element. */
  protected projectButtons: Map<string, HTMLButtonElement>;
  /** Prevents double-initialisation. */
  protected initialized: boolean;

  constructor() {
    this.projectButtons = new Map<string, HTMLButtonElement>();
    this.initialized    = false;
  }

  /* ================================================================
     Public API
     ================================================================ */

  /**
   * Initialises the UI: creates project buttons, control panel, and
   * hides the loading overlay once everything is ready.
   *
   * Idempotent — calling twice has no effect after first run.
   */
  initialize(): void {
    if (this.initialized) return;

    this.createProjectButtons();
    this.createControlPanel();
    this.initialized = true;
    console.log('UI Controller initialised');

    /* Hide the loading overlay with a fade-out after 1 second */
    setTimeout((): void => {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        setTimeout((): void => { overlay.style.display = 'none'; }, 500);
      }
    }, 1000);

    /* Heuristic 6: Show tooltips once everything is loaded */
    const ux = (window as GlobalWindow)['uxEnhancements'] as { addTooltips: () => void; showSystemStatus: (msg: string, type: string) => void } | undefined;
    if (ux) {
      setTimeout((): void => {
        ux.addTooltips();
        ux.showSystemStatus('Ready — press H for help', 'info');
      }, 500);
    }
  }

  /**
   * Switches the active project.
   *
   * Hides the empty-state, shows the canvas wrapper, delegates to
   * projectManager.switchToProject(), then refreshes the active button
   * and project info panel.
   *
   * @param projectId - id of the project to activate
   * @returns true on success, false if the switch failed
   */
  switchProject(projectId: string): boolean {
    const emptyState     = document.getElementById('empty-state');
    const canvasWrapper  = document.getElementById('canvas-wrapper');
    const projectInfo    = document.getElementById('project-info');
    const pm             = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const ux             = (window as GlobalWindow)['uxEnhancements'] as { showLoadingState: (el: HTMLElement | null, v: boolean) => void; updateProjectStatus: (name: string) => void; addToHistory: (id: string) => void; canGoBack: () => boolean; showError: (msg: string, rec: string) => void; addTooltips: () => void } | undefined;

    if (emptyState)    emptyState.style.display   = 'none';
    if (canvasWrapper) canvasWrapper.style.display = 'inline-block';
    if (projectInfo)   projectInfo.style.display   = 'block';

    ux?.showLoadingState(canvasWrapper, true);

    const success = pm.switchToProject(projectId);

    if (success) {
      this.updateActiveButton(projectId);
      this.updateProjectInfo();
      this.ensureAllButtonsExist();

      const project = pm.getCurrentProject();
      if (ux && project) {
        ux.updateProjectStatus(project.name);
        ux.addToHistory(projectId);
        ux.showLoadingState(canvasWrapper, false);
      }

      /* Update back-button visibility (Heuristic 3) */
      const backBtn = document.getElementById('back-btn') as HTMLButtonElement | null;
      if (backBtn && ux) {
        const canGoBack = ux.canGoBack();
        backBtn.classList.toggle('visible', canGoBack);
        backBtn.disabled = !canGoBack;
      }

      /* Heuristic 6: refresh tooltips after switch */
      if (ux) setTimeout((): void => { ux.addTooltips(); }, 100);
    } else {
      /* Heuristic 9: show error with recovery suggestion */
      ux?.showError(
        `Failed to load project: ${projectId}`,
        'Try selecting a different project or reload the page.'
      );
      ux?.showLoadingState(canvasWrapper, false);

      /* Restore empty state on failure */
      if (emptyState)    emptyState.style.display   = 'block';
      if (canvasWrapper) canvasWrapper.style.display = 'none';
      if (projectInfo)   projectInfo.style.display   = 'none';
    }

    return success;
  }

  /* ================================================================
     Button management
     ================================================================ */

  /**
   * Builds sidebar buttons for every registered project.
   *
   * Creates buttons in alphabetical id order so the list is consistent
   * regardless of registration order. Also adds lazy-load stub buttons
   * for well-known projects that may not be registered yet.
   */
  createProjectButtons(): void {
    const container = document.getElementById('project-buttons');
    if (!container) {
      console.warn('project-buttons container not found');
      return;
    }

    container.innerHTML = '';
    this.projectButtons.clear();

    const pm = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const sorted: IProject[] = [...pm.getAllProjects()].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    sorted.forEach((project, _index): void => {
      const btn = this.createButton(project);
      container.appendChild(btn);
      this.projectButtons.set(project.id, btn);
    });

    /* Add stub buttons for expected projects not yet registered */
    const expected: IExpectedProject[] = [
      { id: 'a1a', name: 'A1A - Basic Shapes',            path: 'js/A1A.js' },
      { id: 'a1b', name: 'A1B - Animated Shapes',         path: 'js/A1B.js' },
      { id: 'a1c', name: 'A1C - Pattern Generator',       path: 'js/A1C.js' },
      { id: 'a1d', name: 'A1D - Urban Glide',             path: 'js/A1D.js' },
      { id: 'a1e', name: 'A1E - Sound-Painted Night Sky', path: 'js/A1E.js' },
      { id: 'a1g', name: 'A1G - Interactive Pixel Sort',  path: 'js/A1G.js' },
      { id: 'a1h', name: 'A1H - Corpus Comedian',         path: 'js/A1H.js' },
      { id: 'a1i', name: 'A1I - The Observant Shopper',   path: 'js/A1I.js' },
      { id: 'a1j', name: 'A1J - Dungeon Tile Painter',    path: 'js/A1J.js' },
    ];

    expected.forEach((proj): void => {
      if (!this.projectButtons.has(proj.id)) {
        this.addLazyProjectButton(proj.id, proj.name, proj.path);
      }
    });

    console.log(`Created ${this.projectButtons.size} project buttons`);
  }

  /**
   * Adds a button for a project that was registered after initial render.
   * Inserts alphabetically to maintain consistent list order.
   */
  addProjectButton(projectId: string): void {
    const pm = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const project = pm.getAllProjects().find(p => p.id === projectId);
    if (!project) {
      console.warn(`Cannot add button for ${projectId}: not registered`);
      return;
    }

    if (this.projectButtons.has(projectId)) return; // Already exists

    const container = document.getElementById('project-buttons');
    if (!container) {
      console.warn('project-buttons container not found');
      return;
    }

    const btn = this.createButton(project);

    /* Insert in alphabetical position */
    const children = Array.from(container.children);
    let inserted = false;
    for (const child of children) {
      const existingId = child.getAttribute('data-project-id');
      if (existingId && projectId.localeCompare(existingId) < 0) {
        container.insertBefore(btn, child);
        inserted = true;
        break;
      }
    }
    if (!inserted) container.appendChild(btn);

    this.projectButtons.set(projectId, btn);
    console.log(`Added button for: ${project.name}`);
  }

  /* ================================================================
     Private helpers
     ================================================================ */

  /** Factory — creates a styled sidebar button for a project. */
  private createButton(project: IProject): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'project-btn stagger-item';
    btn.textContent = project.name;
    btn.setAttribute('data-project-id', project.id);
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('tabindex', '0');
    btn.onclick = (): void => { this.switchProject(project.id); };

    if (project.description) {
      btn.setAttribute('title', project.description);
      btn.setAttribute('aria-label', `${project.name}: ${project.description}`);
    }

    return btn;
  }

  /**
   * Updates the `active` CSS class on sidebar buttons.
   * Only the button matching `activeProjectId` receives the class.
   */
  private updateActiveButton(activeProjectId: string): void {
    this.projectButtons.forEach((btn, id): void => {
      btn.classList.toggle('active', id === activeProjectId);
    });
  }

  /** Refreshes the #project-info panel with the current project's metadata. */
  protected updateProjectInfo(): void {
    const pm      = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const project = pm.getCurrentProject();
    if (!project) return;

    const el = document.getElementById('project-info');
    if (el) {
      el.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <small>Canvas size: ${project.canvasSize.width} × ${project.canvasSize.height}</small>
      `;
    }
  }

  /**
   * Creates the Reload and Fullscreen control buttons.
   * Called once during initialize().
   */
  private createControlPanel(): void {
    const panel = document.getElementById('control-panel');
    if (!panel) {
      console.warn('control-panel element not found');
      return;
    }

    try {
      panel.innerHTML = `
        <div class="control-group">
          <button id="reload-btn" class="control-btn">Reload</button>
          <button id="fullscreen-btn" class="control-btn">Fullscreen</button>
        </div>
      `;

      const reloadBtn      = document.getElementById('reload-btn');
      const fullscreenBtn  = document.getElementById('fullscreen-btn');

      if (reloadBtn) {
        reloadBtn.onclick = (): void => {
          try { this.reloadCurrentProject(); }
          catch (err) { console.error('Error reloading project:', err); }
        };
      }

      if (fullscreenBtn) {
        fullscreenBtn.onclick = (): void => {
          try { this.toggleFullscreen(); }
          catch (err) { console.error('Error toggling fullscreen:', err); }
        };
      }
    } catch (err) {
      console.error('Error creating control panel:', err);
    }
  }

  /** Reloads the currently active project by switching to itself. */
  reloadCurrentProject(): void {
    const pm      = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const current = pm.getCurrentProject();
    if (current) {
      pm.switchToProject(current.id);
      console.log(`${current.name} reloaded`);
    }
  }

  /** Toggles the canvas wrapper in/out of fullscreen mode. */
  private toggleFullscreen(): void {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch((err: Error): void => {
        console.log(`Fullscreen error: ${err.message}`);
      });
    } else {
      void document.exitFullscreen();
    }
  }

  /**
   * Adds a stub button that lazy-loads the project's script on first click.
   *
   * If the script is already loaded (project registered), clicking goes
   * straight to switchProject(). Otherwise, the script is injected, the
   * code waits up to 5 × 100 ms for registration, then switches.
   */
  private addLazyProjectButton(
    projectId: string,
    displayName: string,
    scriptPath: string
  ): void {
    const container = document.getElementById('project-buttons');
    if (!container) return;

    const btn       = document.createElement('button');
    btn.className   = 'project-btn';
    btn.textContent = displayName;
    const pm        = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;

    const handleClick = async (): Promise<void> => {
      /* If already registered, switch immediately */
      if (pm.hasProject(projectId)) {
        this.switchProject(projectId);
        return;
      }

      btn.disabled    = true;
      const original  = btn.textContent ?? displayName;
      btn.textContent = 'Loading...';

      try {
        await this.loadScript(scriptPath);

        /* Poll for registration — script execution is async */
        let registered = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise<void>((r): ReturnType<typeof setTimeout> => setTimeout(r, 100 * (attempt + 1)));
          if (pm.hasProject(projectId)) {
            registered = true;
            break;
          }
        }

        /* Rebuild button list to pick up newly registered projects */
        this.createProjectButtons();

        if (registered || pm.hasProject(projectId)) {
          this.switchProject(projectId);
        } else {
          btn.textContent = 'Not Registered';
          setTimeout((): void => { btn.textContent = original; }, 3000);

          const ux = (window as GlobalWindow)['uxEnhancements'] as { showError: (msg: string, rec: string) => void } | undefined;
          ux?.showError(
            `Project "${displayName}" failed to register`,
            'The script loaded but did not register. Check browser console.'
          );
        }
      } catch (err) {
        console.error(`Failed to load ${scriptPath}`, err);
        btn.textContent = 'Load Failed';
        setTimeout((): void => { btn.textContent = original; }, 3000);

        const ux = (window as GlobalWindow)['uxEnhancements'] as { showError: (msg: string, rec: string) => void } | undefined;
        ux?.showError(
          `Failed to load ${displayName}`,
          `Check browser console. Path: ${scriptPath}`
        );
      } finally {
        btn.disabled = false;
      }
    };

    btn.onclick = (): void => { void handleClick(); };
    container.appendChild(btn);
    this.projectButtons.set(projectId, btn);
  }

  /**
   * Injects a <script> tag for `src` if not already present.
   * Resolves when the script has loaded, rejects on error.
   */
  protected loadScript(src: string): Promise<void> {
    return new Promise<void>((resolve, reject): void => {
      const alreadyLoaded = Array.from(document.scripts).some(
        (s): boolean => s.src.endsWith(src)
      );
      if (alreadyLoaded) { resolve(); return; }

      const script    = document.createElement('script');
      script.src      = src;
      script.async    = true;
      script.onload   = (): void => { resolve(); };
      script.onerror  = (err): void => { reject(err); };
      document.body.appendChild(script);
    });
  }

  /**
   * Verifies all registered projects have a sidebar button.
   * Triggers a full button rebuild if any are missing.
   */
  private ensureAllButtonsExist(): void {
    const container = document.getElementById('project-buttons');
    if (!container) return;

    const pm = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const needsRebuild = pm.getAllProjects().some(
      (p): boolean => !this.projectButtons.has(p.id)
    );

    if (needsRebuild) {
      console.log('Rebuilding missing project buttons...');
      this.createProjectButtons();
    }
  }
}

/* ================================================================
   Global singleton + DOM-ready initialisation
   ================================================================ */
export const uiController = new UIController();
(window as GlobalWindow)['uiController'] = uiController;

document.addEventListener('DOMContentLoaded', (): void => {
  console.log('DOM loaded — initialising UI Controller...');

  /*
   * 200 ms delay ensures all project scripts have had time to execute
   * their projectManager.registerProject() calls before we build buttons.
   */
  setTimeout((): void => {
    uiController.initialize();

    const pm       = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const projects = pm.getAllProjects();

    console.log(`Found ${projects.length} projects:`, projects.map((p): string => p.name));

    if (projects.length > 0) {
      const first = projects[0];
      console.log(`Loading default project: ${first.name}`);
      uiController.switchProject(first.id);
    } else {
      console.warn('No projects found — check that project scripts loaded correctly');
    }
  }, 200);
});

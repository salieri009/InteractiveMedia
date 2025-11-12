/**
 * ===============================================
 * UX Enhancements - Nielsen's Heuristics Implementation
 * ===============================================
 * 
 * Implements Nielsen's 10 Usability Heuristics for better user experience:
 * 1. Visibility of system status
 * 2. Match between system and real world
 * 3. User control and freedom
 * 4. Consistency and standards
 * 5. Error prevention
 * 6. Recognition rather than recall
 * 7. Flexibility and efficiency of use
 * 8. Aesthetic and minimalist design
 * 9. Help users recognize, diagnose, and recover from errors
 * 10. Help and documentation
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */

class UXEnhancements {
  constructor() {
    this.notifications = [];
    this.helpVisible = false;
    this.keyboardShortcuts = new Map();
    
    // BUGFIX: Initialize project history in constructor
    this.projectHistory = [];
    this.historyIndex = -1;
    
    this.setupKeyboardShortcuts();
    this.setupAccessibility();
    
    // Initialize heuristics after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeHeuristics();
      });
    } else {
      this.initializeHeuristics();
    }
  }
  
  /**
   * Initialize all heuristic implementations
   */
  initializeHeuristics() {
    // Heuristic 2: Match between system and real world
    this.useFamiliarLanguage();
    
    // Heuristic 4: Consistency and standards
    this.ensureConsistency();
    
    // Heuristic 5: Error prevention
    this.preventErrors();
    
    // Heuristic 8: Aesthetic and minimalist design
    this.minimizeUI();
  }

  /**
   * Heuristic 1: Visibility of System Status
   * Show loading states, current project, progress indicators
   */
  showSystemStatus(message, type = 'info') {
    const statusBar = this.getOrCreateStatusBar();
    statusBar.textContent = message;
    statusBar.className = `status-bar status-${type}`;
    
    // Auto-hide after 3 seconds for info messages
    if (type === 'info') {
      setTimeout(() => {
        if (statusBar.textContent === message) {
          statusBar.textContent = '';
          statusBar.className = 'status-bar';
        }
      }, 3000);
    }
  }

  showLoadingState(element, isLoading) {
    if (isLoading) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
    } else {
      element.classList.remove('loading');
      element.setAttribute('aria-busy', 'false');
    }
  }

  updateProjectStatus(projectName) {
    this.showSystemStatus(`Current Project: ${projectName}`, 'info');
  }

  /**
   * Heuristic 2: Match Between System and Real World
   * Use familiar language and concepts
   */
  useFamiliarLanguage() {
    // Ensure all UI elements use familiar, plain language
    const buttons = document.querySelectorAll('.project-btn, .control-btn');
    buttons.forEach(btn => {
      // Add descriptive labels if missing
      if (!btn.getAttribute('aria-label') && btn.textContent) {
        btn.setAttribute('aria-label', btn.textContent.trim());
      }
    });
    
    // Ensure error messages are user-friendly
    // This is handled in showError() method
  }

  /**
   * Heuristic 3: User Control and Freedom
   * Undo, back button, escape hatch
   * 
   * @deprecated History is now initialized in constructor
   */
  setupUndoRedo() {
    // Store project history for undo
    // BUGFIX: This is now done in constructor, but kept for backward compatibility
    if (!this.projectHistory) {
      this.projectHistory = [];
      this.historyIndex = -1;
    }
  }

  /**
   * Add project to history for undo functionality.
   * 
   * @param {string} projectId - Project ID to add to history
   */
  addToHistory(projectId) {
    // BUGFIX: Ensure projectHistory is initialized
    if (!this.projectHistory) {
      this.projectHistory = [];
      this.historyIndex = -1;
    }
    
    // Remove any history after current index (if user went back and then switched)
    this.projectHistory = this.projectHistory.slice(0, this.historyIndex + 1);
    
    // Add new project to history
    this.projectHistory.push(projectId);
    this.historyIndex = this.projectHistory.length - 1;
    
    // Limit history size to prevent memory issues
    if (this.projectHistory.length > 10) {
      this.projectHistory.shift();
      this.historyIndex--;
    }
  }

  /**
   * Check if user can go back to previous project.
   * 
   * @returns {boolean} True if there's a previous project in history
   */
  canGoBack() {
    // BUGFIX: Ensure projectHistory is initialized
    if (!this.projectHistory || this.projectHistory.length === 0) {
      return false;
    }
    return this.historyIndex > 0;
  }

  /**
   * Go back to previous project in history.
   */
  goBack() {
    // BUGFIX: Ensure projectHistory is initialized
    if (!this.projectHistory || this.projectHistory.length === 0) {
      this.showSystemStatus('No previous project to return to', 'warning');
      return;
    }
    
    if (this.canGoBack()) {
      this.historyIndex--;
      const previousProject = this.projectHistory[this.historyIndex];
      if (previousProject && projectManager && projectManager.hasProject(previousProject)) {
        if (typeof uiController !== 'undefined') {
          uiController.switchProject(previousProject);
          this.showSystemStatus('Returned to previous project', 'info');
        }
      } else {
        // If project no longer exists, remove it from history and try again
        this.projectHistory.splice(this.historyIndex, 1);
        this.historyIndex--;
        if (this.canGoBack()) {
          this.goBack(); // Recursive call to try next project
        } else {
          this.showSystemStatus('Previous project no longer available', 'warning');
        }
      }
    } else {
      this.showSystemStatus('No previous project to return to', 'warning');
    }
  }

  /**
   * Heuristic 4: Consistency and Standards
   * Follow platform conventions
   */
  ensureConsistency() {
    // Ensure all buttons follow consistent patterns
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      // Ensure consistent focus styles
      if (!btn.hasAttribute('tabindex')) {
        btn.setAttribute('tabindex', '0');
      }
      
      // Ensure consistent keyboard interaction
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
    
    // Ensure consistent modal behavior (help panel, notifications)
    // This is handled in toggleHelp() and createNotification()
  }

  /**
   * Heuristic 5: Error Prevention
   * Prevent errors before they happen
   */
  preventErrors() {
    // Disable buttons when actions are not available
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.disabled = !this.canGoBack();
    }
    
    // Validate project switching before attempting
    // This is handled in UIController.switchProject()
    
    // Prevent accidental navigation away during project loading
    window.addEventListener('beforeunload', (e) => {
      const canvasWrapper = document.getElementById('canvas-wrapper');
      if (canvasWrapper && canvasWrapper.classList.contains('loading')) {
        e.preventDefault();
        e.returnValue = 'A project is currently loading. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }

  confirmAction(message, callback) {
    if (confirm(message)) {
      callback();
    }
  }

  /**
   * Heuristic 6: Recognition Rather Than Recall
   * Make objects, actions, and options visible
   */
  addTooltips() {
    // Add tooltips to all buttons
    document.querySelectorAll('.project-btn').forEach(button => {
      const projectId = Array.from(uiController.projectButtons.entries())
        .find(([id, btn]) => btn === button)?.[0];
      
      if (projectId) {
        const project = projectManager.projects.get(projectId);
        if (project) {
          button.setAttribute('title', project.description);
          button.setAttribute('aria-label', `${project.name}: ${project.description}`);
        }
      }
    });
  }

  showContextualHelp(element, helpText) {
    const helpElement = document.createElement('div');
    helpElement.className = 'contextual-help';
    helpElement.textContent = helpText;
    helpElement.setAttribute('role', 'tooltip');
    
    element.appendChild(helpElement);
    
    setTimeout(() => {
      helpElement.remove();
    }, 5000);
  }

  /**
   * Heuristic 7: Flexibility and Efficiency of Use
   * Keyboard shortcuts for power users
   */
  setupKeyboardShortcuts() {
    // Number keys to switch projects (1-9)
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Escape to close modals/help
      if (e.key === 'Escape') {
        this.hideHelp();
        return;
      }

      // Number keys 1-9 to switch projects (use sorted order to match button order)
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const allProjects = projectManager.getAllProjects();
        const sortedProjects = [...allProjects].sort((a, b) => {
          return a.id.localeCompare(b.id);
        });
        if (sortedProjects[num - 1]) {
          uiController.switchProject(sortedProjects[num - 1].id);
          this.showSystemStatus(`Switched to ${sortedProjects[num - 1].name} (Shortcut: ${num})`, 'info');
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && this.canGoBack()) {
        this.goBack();
      }

      // 'H' for help
      if (e.key === 'h' || e.key === 'H') {
        this.toggleHelp();
      }

      // 'R' to reload current project
      if (e.key === 'r' || e.key === 'R') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          uiController.reloadCurrentProject();
          this.showSystemStatus('Project reloaded', 'info');
        }
      }
    });
  }

  /**
   * Heuristic 8: Aesthetic and Minimalist Design
   * Remove unnecessary information
   */
  minimizeUI() {
    // Hide empty analytics panel
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && !analyticsPanel.textContent.trim()) {
      analyticsPanel.style.display = 'none';
    }
    
    // Ensure status bar auto-hides when empty (handled in CSS)
    // Keep help panel minimal - only show when requested
    // Project buttons show only essential information
  }

  /**
   * Heuristic 9: Help Users Recognize, Diagnose, and Recover from Errors
   * Clear error messages with recovery suggestions
   */
  showError(message, recovery = null) {
    const errorElement = this.createNotification('error', message, recovery);
    document.body.appendChild(errorElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  createNotification(type, message, recovery = null) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const messageEl = document.createElement('div');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    if (recovery) {
      const recoveryEl = document.createElement('div');
      recoveryEl.className = 'notification-recovery';
      recoveryEl.textContent = recovery;
      notification.appendChild(recoveryEl);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    
    return notification;
  }

  /**
   * Heuristic 10: Help and Documentation
   * Provide help when needed
   */
  toggleHelp() {
    this.helpVisible = !this.helpVisible;
    const helpPanel = this.getOrCreateHelpPanel();
    
    if (this.helpVisible) {
      helpPanel.classList.add('visible');
      helpPanel.setAttribute('aria-hidden', 'false');
      this.updateHelpContent();
    } else {
      helpPanel.classList.remove('visible');
      helpPanel.setAttribute('aria-hidden', 'true');
    }
  }

  hideHelp() {
    this.helpVisible = false;
    const helpPanel = document.getElementById('help-panel');
    if (helpPanel) {
      helpPanel.classList.remove('visible');
      helpPanel.setAttribute('aria-hidden', 'true');
    }
  }

  updateHelpContent() {
    const helpPanel = document.getElementById('help-panel');
    if (!helpPanel) return;
    
    // Get all projects and sort them by ID for consistent ordering (same as button order)
    const allProjects = projectManager.getAllProjects();
    const sortedProjects = [...allProjects].sort((a, b) => {
      return a.id.localeCompare(b.id);
    });
    
    helpPanel.innerHTML = `
      <div class="help-content">
        <h2>Help & Keyboard Shortcuts</h2>
        <div class="help-section">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><kbd>1-9</kbd> - Switch to project (1st to 9th in order)</li>
            <li><kbd>←</kbd> - Go back to previous project</li>
            <li><kbd>H</kbd> - Toggle this help panel</li>
            <li><kbd>Esc</kbd> - Close help/notifications</li>
            <li><kbd>Ctrl/Cmd + R</kbd> - Reload current project</li>
          </ul>
        </div>
        <div class="help-section">
          <h3>Available Projects (${sortedProjects.length} total)</h3>
          <ul>
            ${sortedProjects.map((p, i) => {
              const shortcut = i < 9 ? `<kbd>${i + 1}</kbd>` : '';
              return `<li>${shortcut} ${shortcut ? '- ' : ''}${p.name}</li>`;
            }).join('')}
          </ul>
          ${sortedProjects.length > 9 ? '<p style="margin-top: 10px; font-size: 0.9em; color: #7f8c8d;">Projects beyond 9th can be accessed by clicking the buttons.</p>' : ''}
        </div>
        <div class="help-section">
          <h3>Tips</h3>
          <ul>
            <li>Click project buttons to switch between projects</li>
            <li>Use the reload button to restart the current project</li>
            <li>Hover over buttons to see descriptions</li>
            <li>Each project has its own canvas and controls</li>
            <li>Projects are sorted alphabetically by ID (A1A, A1B, A1C...)</li>
          </ul>
        </div>
        <button class="help-close" onclick="uxEnhancements.hideHelp()">Close Help</button>
      </div>
    `;
  }

  getOrCreateHelpPanel() {
    let helpPanel = document.getElementById('help-panel');
    if (!helpPanel) {
      helpPanel = document.createElement('div');
      helpPanel.id = 'help-panel';
      helpPanel.className = 'help-panel';
      helpPanel.setAttribute('role', 'dialog');
      helpPanel.setAttribute('aria-labelledby', 'help-title');
      helpPanel.setAttribute('aria-hidden', 'true');
      document.body.appendChild(helpPanel);
    }
    return helpPanel;
  }

  getOrCreateStatusBar() {
    let statusBar = document.getElementById('status-bar');
    if (!statusBar) {
      statusBar = document.createElement('div');
      statusBar.id = 'status-bar';
      statusBar.className = 'status-bar';
      statusBar.setAttribute('role', 'status');
      statusBar.setAttribute('aria-live', 'polite');
      document.body.appendChild(statusBar);
    }
    return statusBar;
  }

  /**
   * Accessibility enhancements
   */
  setupAccessibility() {
    // Add ARIA labels
    // Ensure keyboard navigation
    // Add focus indicators
    document.addEventListener('DOMContentLoaded', () => {
      // Add skip to main content link
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      skipLink.setAttribute('aria-label', 'Skip to main content');
      document.body.insertBefore(skipLink, document.body.firstChild);
    });
  }
}

// Global instance
const uxEnhancements = new UXEnhancements();


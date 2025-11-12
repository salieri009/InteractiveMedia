// ===============================================
// UI Controller - User Interface Management
// ===============================================

class UIController {
  constructor() {
    this.projectButtons = new Map();
    this.initialized = false;
  }

  // Initialize UI
  initialize() {
    if (this.initialized) return;
    
    this.createProjectButtons();
    this.createControlPanel();
    this.initialized = true;
    console.log("🎮 UI Controller initialized");
    
    // UX Enhancement: Hide loading overlay after initialization
    setTimeout(() => {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
      }
    }, 1000);
    
    // Heuristic 6: Add tooltips after initialization
    if (typeof uxEnhancements !== 'undefined') {
      setTimeout(() => {
        uxEnhancements.addTooltips();
        uxEnhancements.showSystemStatus('Ready - Press H for help', 'info');
      }, 500);
    }
  }

  /**
   * Creates buttons for all registered projects.
   * 
   * @description Creates buttons for all projects registered with ProjectManager.
   *              Also ensures buttons exist for projects that may be lazy-loaded.
   *              Buttons are created in registration order.
   */
  createProjectButtons() {
    const buttonContainer = document.getElementById('project-buttons');
    if (!buttonContainer) {
      console.warn('⚠️ Project buttons container not found');
      return;
    }

    // Clear existing buttons and button map
    buttonContainer.innerHTML = '';
    this.projectButtons.clear();

    // BUGFIX: Get all registered projects and sort them for consistent ordering
    const allProjects = projectManager.getAllProjects();
    
    // Sort projects by ID for consistent display order (create new array to avoid mutating original)
    const sortedProjects = [...allProjects].sort((a, b) => {
      return a.id.localeCompare(b.id);
    });

    // Create buttons for all registered projects with stagger animation
    sortedProjects.forEach((project, index) => {
      const button = document.createElement('button');
      button.className = 'project-btn stagger-item';
      button.textContent = project.name;
      button.setAttribute('data-project-id', project.id);
      button.setAttribute('role', 'listitem');
      button.setAttribute('tabindex', '0');
      button.onclick = () => this.switchProject(project.id);
      
      // Add tooltip with description
      if (project.description) {
        button.setAttribute('title', project.description);
        button.setAttribute('aria-label', `${project.name}: ${project.description}`);
      }
      
      buttonContainer.appendChild(button);
      this.projectButtons.set(project.id, button);
    });

    // BUGFIX: Ensure all expected projects have buttons (even if not yet registered)
    // This handles cases where scripts load after UI initialization
    const expectedProjects = [
      { id: 'a1a', name: 'A1A - Basic Shapes', path: 'js/A1A.js' },
      { id: 'a1b', name: 'A1B - Animated Shapes', path: 'js/A1B.js' },
      { id: 'a1c', name: 'A1C - Pattern Generator', path: 'js/A1C.js' },
      { id: 'a1d', name: 'A1D - Urban Glide', path: 'js/A1D.js' },
      { id: 'a1e', name: 'A1E - Sound-Painted Night Sky', path: 'js/A1E.js' },
      { id: 'a1g', name: 'A1G - Interactive Pixel Sort', path: 'js/A1G.js' },
      { id: 'a1h', name: 'A1H - Corpus Comedian', path: 'js/A1H.js' },
      { id: 'a1i', name: 'A1I - The Observant Shopper', path: 'js/A1I.js' },
      { id: 'a1j', name: 'A1J - Dungeon Tile Painter', path: 'js/A1J.js' }
    ];

    // Add lazy-load buttons for projects that aren't registered yet
    expectedProjects.forEach(project => {
      if (!this.projectButtons.has(project.id)) {
        this.addLazyProjectButton(project.id, project.name, project.path);
      }
    });

    console.log(`✅ Created ${this.projectButtons.size} project buttons`);
  }

  // Switch project
  switchProject(projectId) {
    // UX Enhancement: Hide empty state, show canvas area
    const emptyState = document.getElementById('empty-state');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const projectInfo = document.getElementById('project-info');
    
    if (emptyState) emptyState.style.display = 'none';
    if (canvasWrapper) canvasWrapper.style.display = 'inline-block';
    if (projectInfo) projectInfo.style.display = 'block';
    
    // Heuristic 1: Show system status
    if (typeof uxEnhancements !== 'undefined') {
      uxEnhancements.showLoadingState(canvasWrapper, true);
    }
    
    const success = projectManager.switchToProject(projectId);
    if (success) {
      this.updateActiveButton(projectId);
      this.updateProjectInfo();
      // Ensure buttons are still visible after project switch
      this.ensureAllButtonsExist();
      
      // Heuristic 1: Update status, Heuristic 3: Add to history
      if (typeof uxEnhancements !== 'undefined') {
        const project = projectManager.getCurrentProject();
        uxEnhancements.updateProjectStatus(project.name);
        uxEnhancements.addToHistory(projectId);
        uxEnhancements.showLoadingState(canvasWrapper, false);
        
        // Update back button visibility
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
          backBtn.classList.toggle('visible', uxEnhancements.canGoBack());
          backBtn.disabled = !uxEnhancements.canGoBack();
        }
      }
      
      // Heuristic 6: Add tooltips
      if (typeof uxEnhancements !== 'undefined') {
        setTimeout(() => uxEnhancements.addTooltips(), 100);
      }
    } else {
      // Heuristic 9: Show error with recovery suggestion
      if (typeof uxEnhancements !== 'undefined') {
        uxEnhancements.showError(
          `Failed to load project: ${projectId}`,
          'Please try selecting a different project or reload the page.'
        );
        uxEnhancements.showLoadingState(canvasWrapper, false);
      }
      
      // Show empty state again on error
      if (emptyState) emptyState.style.display = 'block';
      if (canvasWrapper) canvasWrapper.style.display = 'none';
      if (projectInfo) projectInfo.style.display = 'none';
    }
    return success;
  }

  // Update active button style
  updateActiveButton(activeProjectId) {
    this.projectButtons.forEach((button, projectId) => {
      if (projectId === activeProjectId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Update project information
  updateProjectInfo() {
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject) return;

    const infoElement = document.getElementById('project-info');
    if (infoElement) {
      infoElement.innerHTML = `
        <h3>${currentProject.name}</h3>
        <p>${currentProject.description}</p>
        <small>Canvas size: ${currentProject.canvasSize.width} × ${currentProject.canvasSize.height}</small>
      `;
    }
  }

  /**
   * Creates the control panel with action buttons.
   * 
   * @private
   * @returns {void}
   * 
   * @description Creates UI controls for project management (reload, fullscreen).
   *              Adds event listeners for button interactions.
   * 
   * @throws {Error} If control panel element is not found or buttons fail to create
   */
  createControlPanel() {
    const controlPanel = document.getElementById('control-panel');
    if (!controlPanel) {
      console.warn('⚠️ Control panel element not found');
      return;
    }

    try {
      controlPanel.innerHTML = `
        <div class="control-group">
          <button id="reload-btn" class="control-btn">🔄 Reload</button>
          <button id="fullscreen-btn" class="control-btn">📺 Fullscreen</button>
        </div>
      `;

      // Add event listeners with error handling
      const reloadBtn = document.getElementById('reload-btn');
      const fullscreenBtn = document.getElementById('fullscreen-btn');
      
      if (reloadBtn) {
        reloadBtn.onclick = () => {
          try {
            this.reloadCurrentProject();
          } catch (error) {
            console.error('❌ Error reloading project:', error);
          }
        };
      } else {
        console.error('❌ Reload button not found after creation');
      }
      
      if (fullscreenBtn) {
        fullscreenBtn.onclick = () => {
          try {
            this.toggleFullscreen();
          } catch (error) {
            console.error('❌ Error toggling fullscreen:', error);
          }
        };
      } else {
        console.error('❌ Fullscreen button not found after creation');
      }
    } catch (error) {
      console.error('❌ Error creating control panel:', error);
    }
  }

  // Reload current project
  reloadCurrentProject() {
    const current = projectManager.getCurrentProject();
    if (current) {
      projectManager.switchToProject(current.id);
      console.log(`🔄 ${current.name} reloaded`);
    }
  }

  // Toggle fullscreen
  toggleFullscreen() {
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (!canvasWrapper) return;

    if (!document.fullscreenElement) {
      canvasWrapper.requestFullscreen().catch(err => {
        console.log(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Add project button (used when registering new projects dynamically).
   * 
   * @param {string} projectId - Project ID to add button for
   * @description Adds a button for a newly registered project.
   *              If button already exists, updates it instead of creating duplicate.
   */
  addProjectButton(projectId) {
    const project = projectManager.projects.get(projectId);
    if (!project) {
      console.warn(`⚠️ Cannot add button for project ${projectId}: project not found`);
      return;
    }

    // BUGFIX: Check if button already exists to avoid duplicates
    if (this.projectButtons.has(projectId)) {
      console.log(`ℹ️ Button for ${projectId} already exists, skipping`);
      return;
    }

    const buttonContainer = document.getElementById('project-buttons');
    if (!buttonContainer) {
      console.warn('⚠️ Button container not found');
      return;
    }

    const button = document.createElement('button');
    button.className = 'project-btn';
    button.textContent = project.name;
    button.setAttribute('data-project-id', projectId);
    button.setAttribute('role', 'listitem');
    button.setAttribute('tabindex', '0');
    button.onclick = () => this.switchProject(project.id);
    
    // Add tooltip with description
    if (project.description) {
      button.setAttribute('title', project.description);
      button.setAttribute('aria-label', `${project.name}: ${project.description}`);
    }
    
    // Insert button in sorted position (maintain alphabetical order)
    const existingButtons = Array.from(buttonContainer.children);
    let inserted = false;
    
    for (let i = 0; i < existingButtons.length; i++) {
      const existingId = existingButtons[i].getAttribute('data-project-id');
      if (existingId && projectId.localeCompare(existingId) < 0) {
        buttonContainer.insertBefore(button, existingButtons[i]);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      buttonContainer.appendChild(button);
    }
    
    this.projectButtons.set(projectId, button);
    console.log(`✅ Added button for project: ${project.name}`);
  }

  // Add a button that lazy-loads the script when clicked
  addLazyProjectButton(projectId, displayName, scriptPath) {
    const buttonContainer = document.getElementById('project-buttons');
    if (!buttonContainer) return;

    const button = document.createElement('button');
    button.className = 'project-btn';
    button.textContent = displayName;

    const onClick = async () => {
      // If already registered, just switch
      if (projectManager.projects.has(projectId)) {
        this.switchProject(projectId);
        return;
      }

      // Otherwise, try loading the script and then switch
      button.disabled = true;
      const original = button.textContent;
      button.textContent = 'Loading...';
      try {
        await this.loadScript(scriptPath);
        
        // BUGFIX: Wait longer for script to execute and register project
        // Scripts may need time to execute their registration code
        // Try multiple times with increasing delays
        let registered = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          
          if (projectManager.projects.has(projectId)) {
            registered = true;
            break;
          }
        }
        
        // Rebuild buttons in case registration just happened
        this.createProjectButtons();
        
        // Check again after waiting
        if (registered || projectManager.projects.has(projectId)) {
          this.switchProject(projectId);
        } else {
          console.warn(`⚠️ Script loaded but project "${projectId}" not registered after ${5} attempts.`);
          console.warn(`   Make sure the script calls projectManager.registerProject('${projectId}', ...)`);
          console.warn(`   Script path: ${scriptPath}`);
          console.warn(`   Available projects:`, Array.from(projectManager.projects.keys()));
          
          // Show user-friendly message
          button.textContent = '⚠️ Not Registered';
          setTimeout(() => {
            button.textContent = original;
          }, 3000);
          
          // Heuristic 9: Show error with recovery
          if (typeof uxEnhancements !== 'undefined') {
            uxEnhancements.showError(
              `Project "${displayName}" failed to register`,
              `The script loaded but didn't register. Check browser console for errors.`
            );
          }
        }
      } catch (e) {
        console.error(`❌ Failed to load ${scriptPath}`, e);
        button.textContent = '❌ Load Failed';
        
        // Heuristic 9: Show error with recovery
        if (typeof uxEnhancements !== 'undefined') {
          uxEnhancements.showError(
            `Failed to load ${displayName}`,
            `Check browser console for details. File path: ${scriptPath}`
          );
        }
        
        setTimeout(() => {
          button.textContent = original;
        }, 3000);
      } finally {
        button.disabled = false;
      }
    };

    button.onclick = onClick;
    buttonContainer.appendChild(button);
    this.projectButtons.set(projectId, button);
  }

  // Utility to load a script dynamically
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts).some(s => s.src.endsWith(src));
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  /**
   * Ensures all registered projects have corresponding buttons.
   * 
   * @private
   * @returns {void}
   * 
   * @description Checks if all registered projects have UI buttons.
   *              If any are missing, recreates all buttons. This is a
   *              safety mechanism to ensure UI stays in sync with registered
   *              projects.
   * 
   * @bugfix Removed hardcoded project IDs - now dynamically checks all
   *         registered projects from ProjectManager
   */
  ensureAllButtonsExist() {
    const buttonContainer = document.getElementById('project-buttons');
    if (!buttonContainer) {
      console.warn('⚠️ Button container not found');
      return;
    }

    // BUGFIX: Get expected projects dynamically from ProjectManager
    // instead of hardcoded list
    const registeredProjects = projectManager.getAllProjects();
    let needsRecreation = false;

    // Check if any registered project is missing a button
    registeredProjects.forEach(project => {
      if (!this.projectButtons.has(project.id)) {
        console.log(`⚠️ Missing button for project: ${project.id}`);
        needsRecreation = true;
      }
    });

    if (needsRecreation) {
      console.log('🔄 Recreating missing buttons...');
      this.createProjectButtons();
    }
  }
}

// Global UI controller instance
const uiController = new UIController();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 DOM loaded, initializing UI Controller...');
  
  // Slight delay to wait for all project files to load
  setTimeout(() => {
    uiController.initialize();
    
    // Load first project by default
    const projects = projectManager.getAllProjects();
    console.log(`📁 Found ${projects.length} projects:`, projects.map(p => p.name));
    
    if (projects.length > 0) {
      console.log(`🎨 Loading default project: ${projects[0].name}`);
      uiController.switchProject(projects[0].id);
    } else {
      console.warn('⚠️ No projects found!');
    }

    // Initialize enhanced features if APIClient is available
    if (typeof EnhancedUIController !== 'undefined') {
      console.log('🚀 Initializing enhanced UI controller...');
      const enhancedController = new EnhancedUIController();
      // Copy existing state
      enhancedController.projectButtons = uiController.projectButtons;
      enhancedController.initialized = uiController.initialized;
      
      // Replace with enhanced version
      window.uiController = enhancedController;
      
      // Temporarily disable API calls to focus on p5.js issues
      console.log('⚠️ API calls temporarily disabled to focus on p5.js issues');
      /*
      // Initialize enhanced features
      enhancedController.loadProjectsFromAPI().catch(console.warn);
      enhancedController.loadAnalytics().catch(error => {
        console.warn('Analytics loading failed:', error);
      });
      */
    }
  }, 200); // Increased delay to ensure all projects are registered
});

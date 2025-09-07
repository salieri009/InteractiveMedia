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
  }

  // Create project buttons
  createProjectButtons() {
    const buttonContainer = document.getElementById('project-buttons');
    if (!buttonContainer) return;

    // Remove existing buttons
    buttonContainer.innerHTML = '';

    // Create buttons for all registered projects
    projectManager.getAllProjects().forEach(project => {
      const button = document.createElement('button');
      button.className = 'project-btn';
      button.textContent = project.name;
      button.onclick = () => this.switchProject(project.id);
      
      buttonContainer.appendChild(button);
      this.projectButtons.set(project.id, button);
    });

    // Ensure A1B and A1C buttons exist even if scripts failed to load
    const ensureButton = (id, name, scriptPath) => {
      if (!this.projectButtons.has(id)) {
        this.addLazyProjectButton(id, name, scriptPath);
      }
    };

  ensureButton('a1b', 'A1B - Animated Shapes', 'js/A1B.js');
  ensureButton('a1c', 'A1C - Pattern Generator', 'js/A1C.js');
  // Ensure A1D exists as a lazy-load button (may be added later)
  ensureButton('a1d', 'A1D - Simple Demo', 'js/A1D.js');
  }

  // Switch project
  switchProject(projectId) {
    const success = projectManager.switchToProject(projectId);
    if (success) {
      this.updateActiveButton(projectId);
      this.updateProjectInfo();
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

  // Create control panel
  createControlPanel() {
    const controlPanel = document.getElementById('control-panel');
    if (!controlPanel) return;

    controlPanel.innerHTML = `
      <div class="control-group">
        <button id="reload-btn" class="control-btn">🔄 Reload</button>
        <button id="fullscreen-btn" class="control-btn">📺 Fullscreen</button>
      </div>
    `;

    // Add event listeners
    document.getElementById('reload-btn').onclick = () => this.reloadCurrentProject();
    document.getElementById('fullscreen-btn').onclick = () => this.toggleFullscreen();
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

  // Add project button (used when registering new projects)
  addProjectButton(projectId) {
    const project = projectManager.projects.get(projectId);
    if (!project) return;

    const buttonContainer = document.getElementById('project-buttons');
    const button = document.createElement('button');
    button.className = 'project-btn';
    button.textContent = project.name;
    button.onclick = () => this.switchProject(project.id);
    
    buttonContainer.appendChild(button);
    this.projectButtons.set(projectId, button);
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
        // Rebuild buttons in case registration just happened
        this.createProjectButtons();
        if (projectManager.projects.has(projectId)) {
          this.switchProject(projectId);
        } else {
          console.warn(`Script loaded but project "${projectId}" not registered`);
        }
      } catch (e) {
        console.error(`Failed to load ${scriptPath}`, e);
        alert(`Failed to load ${displayName}. Check file path: ${scriptPath}`);
      } finally {
        button.disabled = false;
        button.textContent = original;
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

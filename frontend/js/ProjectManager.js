/**
 * ===============================================
 * Project Manager - Project Switching System
 * ===============================================
 * 
 * Manages multiple p5.js projects, handles project registration,
 * switching, and canvas lifecycle management.
 * 
 * @class ProjectManager
 * @description Central manager for all interactive media projects.
 *              Handles p5.js instance creation, project registration,
 *              and seamless switching between projects.
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */
class ProjectManager {
  /**
   * Creates a new ProjectManager instance.
   * 
   * @constructor
   * @description Initializes the project manager with empty collections
   *              and default state. Projects are stored in a Map for
   *              efficient lookup by ID.
   */
  constructor() {
    /** @type {Map<string, Object>} Map of project ID to project configuration */
    this.projects = new Map();
    
    /** @type {Object|null} Currently active project configuration */
    this.currentProject = null;
    
    /** @type {p5.Element|null} Reference to the p5.js canvas element */
    this.canvas = null;
    
    /** @type {boolean} Flag indicating if the draw loop is running */
    this.isRunning = false;
    
    /** @type {p5|null} Reference to the current p5.js instance */
    this.p5Instance = null;
    
    /** @type {boolean} Flag indicating if p5.js is ready for use */
    this.p5Ready = false;
    
    /** @type {number|null} Timeout ID for setup delay (prevents race conditions) */
    this.setupTimeoutId = null;
  }

  /**
   * Initializes a default p5.js instance (legacy method, deprecated).
   * 
   * @deprecated This method is no longer used. setupCanvas() creates
   *             instances per project instead. Kept for backward compatibility.
   * 
   * @returns {void}
   */
  initializeP5() {
    if (this.p5Ready) return;
    
    console.warn("⚠️ initializeP5() is deprecated. Use setupCanvas() instead.");
    console.log("🚀 Initializing p5.js instance...");
    
    // Create p5 instance with proper setup
    this.p5Instance = new p5((p) => {
      // Store p5 instance globally
      window.p5Instance = p;
      
      // Expose p5.js functions and variables globally
      this.exposeP5Globals(p);
      
      // Set up canvas
      p.setup = () => {
        // Default canvas size
        this.canvas = p.createCanvas(400, 400);
        this.canvas.parent('canvas-wrapper');
        console.log("🎨 Default canvas created successfully");
        this.p5Ready = true;
        
        // Initialize first project if available
        if (this.projects.size > 0) {
          const firstProject = Array.from(this.projects.values())[0];
          this.switchToProject(firstProject.id);
        }
      };
      
      p.draw = () => {
        if (this.currentProject && this.currentProject.draw) {
          this.currentProject.draw();
        }
      };
      
      p.mousePressed = () => {
        if (this.currentProject && this.currentProject.mousePressed) {
          this.currentProject.mousePressed();
        }
      };
      
      p.keyPressed = () => {
        if (this.currentProject && this.currentProject.keyPressed) {
          this.currentProject.keyPressed();
        }
      };
      
      p.windowResized = () => {
        if (this.currentProject && this.currentProject.windowResized) {
          this.currentProject.windowResized();
        }
      };
    });
  }

  /**
   * Registers a new project with the project manager.
   * 
   * @param {string} id - Unique identifier for the project (e.g., 'a1a', 'a1b')
   * @param {string} name - Display name for the project
   * @param {Function} setupFunction - Function called once when project is initialized
   * @param {Function} drawFunction - Function called every frame for rendering
   * @param {Object} [options={}] - Additional project configuration options
   * @param {Function} [options.mousePressed] - Mouse press event handler
   * @param {Function} [options.keyPressed] - Keyboard press event handler
   * @param {Function} [options.windowResized] - Window resize event handler
   * @param {Function} [options.cleanup] - Cleanup function called when switching away
   * @param {string} [options.description] - Project description text
   * @param {Object} [options.canvasSize] - Canvas dimensions {width, height}
   * 
   * @returns {boolean} True if registration was successful, false otherwise
   * 
   * @throws {Error} If p5.js is not loaded or if project ID is invalid
   * 
   * @example
   * projectManager.registerProject(
   *   'a1a',
   *   'A1A - Basic Shapes',
   *   setupA1A,
   *   drawA1A,
   *   {
   *     description: 'Basic shapes demonstration',
   *     canvasSize: { width: 400, height: 400 }
   *   }
   * );
   */
  registerProject(id, name, setupFunction, drawFunction, options = {}) {
    // Input validation
    if (!id || typeof id !== 'string') {
      console.error('❌ Invalid project ID:', id);
      return false;
    }
    
    if (!name || typeof name !== 'string') {
      console.error('❌ Invalid project name:', name);
      return false;
    }
    
    if (typeof setupFunction !== 'function' || typeof drawFunction !== 'function') {
      console.error('❌ Setup and draw must be functions');
      return false;
    }
    
    // Check if p5.js is available
    if (typeof p5 === 'undefined') {
      console.error('❌ p5.js library not loaded!');
      return false;
    }
    
    // Validate canvas size
    const canvasSize = options.canvasSize || { width: 400, height: 400 };
    if (!canvasSize.width || !canvasSize.height || 
        canvasSize.width < 1 || canvasSize.height < 1) {
      console.warn('⚠️ Invalid canvas size, using defaults');
      canvasSize.width = 400;
      canvasSize.height = 400;
    }
    
    // Register the project
    this.projects.set(id, {
      id,
      name,
      setup: setupFunction,
      draw: drawFunction,
      mousePressed: options.mousePressed || (() => {}),
      keyPressed: options.keyPressed || (() => {}),
      windowResized: options.windowResized || (() => {}),
      cleanup: options.cleanup || null,
      description: options.description || "Project description",
      canvasSize: canvasSize
    });
    
    console.log(`📁 Project registered: ${name} (${id})`);
    return true;
  }

  /**
   * Exposes p5.js functions and variables to the global window object.
   * 
   * @private
   * @param {p5} p - The p5.js instance to expose
   * @returns {void}
   * 
   * @description This method makes p5.js functions available globally so that
   *              project code can use them without needing to reference the
   *              p5 instance directly. This provides a more natural coding
   *              experience similar to p5.js global mode.
   * 
   *              Variables are exposed as getters to ensure they always reflect
   *              the current p5 instance's state. Functions are bound to the
   *              p5 instance to maintain proper context.
   * 
   * @throws {Error} If p5 instance is invalid or exposure fails
   */
  exposeP5Globals(p) {
    try {
      // Store p5 instance globally for direct access
      window.currentP5 = p;
      
      // BUGFIX: p5.js needs to write to these properties, so we can't use read-only getters
      // Solution: Use getter/setter that redirects to p5 instance, allowing p5.js to manage them
      // The setter will be a no-op since p5.js manages these internally on the instance
      
      // BUGFIX: Define properties with both getter and setter
      // p5.js needs to write to these, but we redirect reads to the p5 instance
      // The setter accepts the value but does nothing - p5.js manages these on the instance
      Object.defineProperty(window, 'mouseX', { 
        get: () => p.mouseX,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'mouseY', { 
        get: () => p.mouseY,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'pmouseX', { 
        get: () => p.pmouseX,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'pmouseY', { 
        get: () => p.pmouseY,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'width', { 
        get: () => p.width,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'height', { 
        get: () => p.height,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'frameCount', { 
        get: () => p.frameCount,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'key', { 
        get: () => p.key,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'keyCode', { 
        get: () => p.keyCode,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      Object.defineProperty(window, 'mouseIsPressed', { 
        get: () => p.mouseIsPressed,
        set: (val) => { /* No-op - p5.js manages this on instance */ },
        configurable: true,
        enumerable: true
      });
      
  // Drawing functions - direct assignment
  window.background = p.background.bind(p);
  window.fill = p.fill.bind(p);
  window.noFill = p.noFill.bind(p);
  window.stroke = p.stroke.bind(p);
  window.noStroke = p.noStroke.bind(p);
  window.strokeWeight = p.strokeWeight.bind(p);
  // Color functions
  window.red = p.red.bind(p);
  window.green = p.green.bind(p);
  window.blue = p.blue.bind(p);
  window.lerpColor = p.lerpColor.bind(p);
      
      // Shape functions - direct assignment
      window.circle = p.circle.bind(p);
      window.ellipse = p.ellipse.bind(p);
      window.rect = p.rect.bind(p);
      window.square = p.square.bind(p);
      window.line = p.line.bind(p);
      window.point = p.point.bind(p);
      window.triangle = p.triangle.bind(p);
      
      // Transform functions - direct assignment
      window.push = p.push.bind(p);
      window.pop = p.pop.bind(p);
      window.translate = p.translate.bind(p);
      window.rotate = p.rotate.bind(p);
      window.scale = p.scale.bind(p);
      
      // Math functions and constants
      window.PI = p.PI;
      window.TWO_PI = p.TWO_PI;
      window.HALF_PI = p.HALF_PI;
      window.int = p.int.bind(p);
      window.floor = p.floor.bind(p);
      window.ceil = p.ceil.bind(p);
      window.round = p.round.bind(p);
      window.sin = p.sin.bind(p);
      window.cos = p.cos.bind(p);
      window.tan = p.tan.bind(p);
      window.map = p.map.bind(p);
      window.constrain = p.constrain.bind(p);
      window.dist = p.dist.bind(p);
      window.min = p.min.bind(p);
      window.max = p.max.bind(p);
      window.random = p.random.bind(p);
      
      // Loop control
      window.noLoop = p.noLoop.bind(p);
      window.loop = p.loop.bind(p);
      
      // Text functions
      window.text = p.text.bind(p);
      window.textAlign = p.textAlign.bind(p);
      window.textSize = p.textSize.bind(p);
      window.textStyle = p.textStyle.bind(p);
      window.NORMAL = p.NORMAL;
      window.ITALIC = p.ITALIC;
      window.BOLD = p.BOLD;
      window.BOLDITALIC = p.BOLDITALIC;
      
      // Color mode
      window.colorMode = p.colorMode.bind(p);
      window.HSB = p.HSB;
      window.RGB = p.RGB;
      
      // Constants
      window.LEFT = p.LEFT;
      window.RIGHT = p.RIGHT;
      window.CENTER = p.CENTER;
      window.TOP = p.TOP;
      window.BOTTOM = p.BOTTOM;
      
      // Canvas functions
      window.createCanvas = p.createCanvas.bind(p);
      window.resizeCanvas = p.resizeCanvas.bind(p);
      
      // Graphics and image functions
      window.createGraphics = p.createGraphics.bind(p);
      window.image = p.image.bind(p);
      window.loadImage = p.loadImage.bind(p);
      window.color = p.color.bind(p);
      window.hue = p.hue.bind(p);
      window.saturation = p.saturation.bind(p);
      window.brightness = p.brightness.bind(p);
      window.alpha = p.alpha.bind(p);
      
      // DOM and input functions
      window.createFileInput = p.createFileInput.bind(p);
      window.createButton = p.createButton.bind(p);
      window.createSlider = p.createSlider.bind(p);
      window.createInput = p.createInput.bind(p);
      window.createCapture = p.createCapture.bind(p);
      
      // Save functions
      window.saveCanvas = p.saveCanvas.bind(p);
      window.save = p.save.bind(p);
      
      // Video and media constants
      window.VIDEO = p.VIDEO;
      window.AUDIO = p.AUDIO;
      
      // Mouse and keyboard properties are now in window.p5vars to avoid conflicts
      
      // Math functions
      window.floor = p.floor || Math.floor;
      window.ceil = p.ceil || Math.ceil;
      window.round = p.round || Math.round;
      window.abs = p.abs || Math.abs;
      window.sqrt = p.sqrt || Math.sqrt;
      window.pow = p.pow || Math.pow;
      
      console.log("✅ p5.js functions exposed globally using direct assignment");
    } catch (error) {
      console.error("❌ Error exposing p5.js functions:", error);
    }
  }

  /**
   * Switches to a different project, handling cleanup and initialization.
   * 
   * @param {string} projectId - The ID of the project to switch to
   * @returns {boolean} True if switch was successful, false otherwise
   * 
   * @description This method:
   * 1. Validates the project exists
   * 2. Cleans up the current project (calls cleanup function if available)
   * 3. Removes the existing p5.js instance
   * 4. Creates a new p5.js instance for the new project
   * 5. Updates the UI with project information
   * 
   * @example
   * const success = projectManager.switchToProject('a1b');
   * if (success) {
   *   console.log('Project switched successfully');
   * }
   */
  switchToProject(projectId) {
    // Input validation
    if (!projectId || typeof projectId !== 'string') {
      console.error(`❌ Invalid project ID: ${projectId}`);
      return false;
    }
    
    if (!this.projects.has(projectId)) {
      console.error(`❌ Project not found: ${projectId}`);
      return false;
    }

    // Call cleanup on current project if it exists
    if (this.currentProject && this.currentProject.cleanup) {
      console.log(`🧹 Cleaning up previous project: ${this.currentProject.name}`);
      try {
        this.currentProject.cleanup();
      } catch (error) {
        console.error('❌ Error during project cleanup:', error);
        // Continue with switch even if cleanup fails
      }
    }

    // Clear any pending setup timeouts to prevent race conditions
    if (this.setupTimeoutId) {
      clearTimeout(this.setupTimeoutId);
      this.setupTimeoutId = null;
    }

    // Clean up existing canvas and p5 instance
    this.cleanupP5Instance();

    // Stop current drawing if running
    this.isRunning = false;

    // Load new project
    this.currentProject = this.projects.get(projectId);
    
    // Setup canvas for new project
    this.setupCanvas();
    
    // Update project information display
    this.updateProjectInfo();
    
    console.log(`🎨 Switched to project: ${this.currentProject.name}`);
    return true;
  }
  
  /**
   * Safely removes the current p5.js instance.
   * 
   * @private
   * @returns {void}
   * 
   * @description Properly disposes of p5.js resources to prevent memory leaks.
   *              This is critical when switching between projects.
   */
  cleanupP5Instance() {
    if (this.p5Instance) {
      try {
        // Stop the draw loop before removing
        if (this.p5Instance.noLoop) {
          this.p5Instance.noLoop();
        }
        
        // Remove the instance
        this.p5Instance.remove();
        this.p5Instance = null;
        this.canvas = null;
        this.p5Ready = false;
      } catch (error) {
        console.error('❌ Error cleaning up p5 instance:', error);
      }
    }
  }

  /**
   * Sets up the canvas for the current project.
   * 
   * @private
   * @returns {void}
   * 
   * @description Creates a new p5.js instance in instance mode, sets up
   *              event handlers, and initializes the project. Uses a small
   *              delay to ensure p5.js functions are properly exposed before
   *              calling the project's setup function.
   * 
   * @throws {Error} If canvas wrapper element is not found in DOM
   */
  setupCanvas() {
    if (!this.currentProject) {
      console.error('❌ No current project to setup canvas for');
      return;
    }

    // Check if canvas wrapper exists in DOM
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (!canvasWrapper) {
      console.error('❌ Canvas wrapper element not found in DOM!');
      return;
    }

    // Validate canvas dimensions
    const { width, height } = this.currentProject.canvasSize;
    if (!width || !height || width < 1 || height < 1) {
      console.error('❌ Invalid canvas dimensions:', { width, height });
      return;
    }
    
    // Ensure previous instance is cleaned up (should already be done, but safety check)
    this.cleanupP5Instance();

    // Clear canvas wrapper to remove any existing elements
    canvasWrapper.innerHTML = '';
    
    // Create new p5 instance in instance mode
    // This prevents conflicts with multiple p5 instances
    const sketch = (p) => {
      /**
       * p5.js setup function - called once when canvas is created
       */
      p.setup = () => {
        try {
          // Create canvas with specified dimensions
          this.canvas = p.createCanvas(width, height);
          
          // Make p5 functions and variables globally accessible
          // This allows project code to use p5.js functions directly
          this.exposeP5Globals(p);
          
          // Use a small delay to ensure functions are properly exposed
          // This prevents race conditions where setup is called before
          // global functions are available
          this.setupTimeoutId = setTimeout(() => {
            try {
              // Call the project's setup function
              if (this.currentProject && this.currentProject.setup) {
                this.currentProject.setup();
              }
              this.isRunning = true;
              console.log(`✅ Canvas created for ${this.currentProject.name}: ${width}x${height}`);
            } catch (error) {
              console.error(`❌ Error in project setup for ${this.currentProject.name}:`, error);
              this.isRunning = false;
            }
            this.setupTimeoutId = null;
          }, 10);
        } catch (error) {
          console.error('❌ Error in p5 setup:', error);
          this.isRunning = false;
        }
      };
      
      /**
       * p5.js draw function - called every frame (typically 60fps)
       */
      p.draw = () => {
        if (this.isRunning && this.currentProject && this.currentProject.draw) {
          try {
            // Ensure p5 functions are accessible (re-expose in case of issues)
            if (typeof window.background !== 'function') {
              this.exposeP5Globals(p);
            }
            
            // Call the project's draw function
            this.currentProject.draw();
          } catch (error) {
            console.error('❌ Error in project draw loop:', error);
            // Stop the loop to prevent error spam
            this.isRunning = false;
            if (p.noLoop) {
              p.noLoop();
            }
          }
        }
      };

      /**
       * Mouse press event handler
       */
      p.mousePressed = () => {
        if (this.currentProject && this.currentProject.mousePressed) {
          try {
            // Ensure p5 variables are accessible
            this.exposeP5Globals(p);
            this.currentProject.mousePressed();
          } catch (error) {
            console.error('❌ Error in mousePressed handler:', error);
          }
        }
      };

      /**
       * Keyboard press event handler
       */
      p.keyPressed = () => {
        if (this.currentProject && this.currentProject.keyPressed) {
          try {
            // Ensure p5 variables are accessible
            this.exposeP5Globals(p);
            this.currentProject.keyPressed();
          } catch (error) {
            console.error('❌ Error in keyPressed handler:', error);
          }
        }
      };
      
      /**
       * Window resize event handler
       */
      p.windowResized = () => {
        if (this.currentProject && this.currentProject.windowResized) {
          try {
            // Pass the p5 instance to the windowResized function
            // This allows projects to handle resizing if needed
            this.currentProject.windowResized(p);
          } catch (error) {
            console.error('❌ Error in windowResized handler:', error);
          }
        }
      };
    };
    
    // Initialize new p5 instance with the sketch function
    // The second parameter specifies the parent element
    try {
      this.p5Instance = new p5(sketch, canvasWrapper);
      this.p5Ready = true;
    } catch (error) {
      console.error('❌ Failed to create p5 instance:', error);
      this.p5Ready = false;
      this.isRunning = false;
    }
  }

  /**
   * Updates the project information display in the UI.
   * 
   * @private
   * @returns {void}
   * 
   * @description Updates the project-info element with the current project's
   *              name and description. This provides visual feedback to users
   *              about which project is currently active.
   */
  updateProjectInfo() {
    const infoElement = document.getElementById('project-info');
    if (infoElement && this.currentProject) {
      // Sanitize HTML to prevent XSS attacks
      const name = this.escapeHtml(this.currentProject.name);
      const description = this.escapeHtml(this.currentProject.description);
      
      infoElement.innerHTML = `
        <h3>${name}</h3>
        <p>${description}</p>
      `;
    }
  }
  
  /**
   * Escapes HTML special characters to prevent XSS attacks.
   * 
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text safe for HTML insertion
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Gets all registered projects.
   * 
   * @returns {Array<Object>} Array of all registered project configurations
   * 
   * @description Returns a copy of all registered projects as an array.
   *              Useful for UI generation and project listing.
   * 
   * @example
   * const projects = projectManager.getAllProjects();
   * projects.forEach(project => {
   *   console.log(project.name);
   * });
   */
  getAllProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Gets the currently active project.
   * 
   * @returns {Object|null} Current project configuration or null if no project is active
   * 
   * @description Returns the configuration object for the currently active project.
   *              This includes all project metadata, event handlers, and settings.
   * 
   * @example
   * const current = projectManager.getCurrentProject();
   * if (current) {
   *   console.log(`Active project: ${current.name}`);
   * }
   */
  getCurrentProject() {
    return this.currentProject;
  }
  
  /**
   * Checks if a project is registered.
   * 
   * @param {string} projectId - The project ID to check
   * @returns {boolean} True if project exists, false otherwise
   */
  hasProject(projectId) {
    return this.projects.has(projectId);
  }
  
  /**
   * Gets the number of registered projects.
   * 
   * @returns {number} Number of registered projects
   */
  getProjectCount() {
    return this.projects.size;
  }
}

/**
 * Global project manager instance.
 * 
 * @type {ProjectManager}
 * @description Singleton instance of ProjectManager available globally.
 *              All project registration and switching should go through
 *              this instance.
 * 
 * @example
 * // Register a new project
 * projectManager.registerProject('myproject', 'My Project', setup, draw);
 * 
 * // Switch to a project
 * projectManager.switchToProject('myproject');
 */
const projectManager = new ProjectManager();

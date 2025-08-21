// ===============================================
// Project Manager - Project Switching System
// ===============================================

class ProjectManager {
  constructor() {
    this.projects = new Map();
    this.currentProject = null;
    this.canvas = null;
    this.isRunning = false;
    this.p5Instance = null;
    this.p5Ready = false;
  }

  // Initialize p5.js instance
  initializeP5() {
    if (this.p5Ready) return;
    
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

  // Register a new project
  registerProject(id, name, setupFunction, drawFunction, options = {}) {
    this.projects.set(id, {
      id,
      name,
      setup: setupFunction,
      draw: drawFunction,
      mousePressed: options.mousePressed || (() => {}),
      keyPressed: options.keyPressed || (() => {}),
      windowResized: options.windowResized || (() => {}),
      description: options.description || "Project description",
      canvasSize: options.canvasSize || { width: 400, height: 400 }
    });
    console.log(`📁 Project registered: ${name}`);
    
    // Initialize p5 if this is the first project
    if (!this.p5Ready && typeof p5 !== 'undefined') {
      this.initializeP5();
    }
  }

  // Expose p5.js functions and variables globally
  exposeP5Globals(p) {
    try {
      // Store p5 instance globally for direct access
      window.currentP5 = p;
      
      // Variables - direct assignment for immediate access
      window.mouseX = p.mouseX;
      window.mouseY = p.mouseY;
      window.pmouseX = p.pmouseX;
      window.pmouseY = p.pmouseY;
      window.width = p.width;
      window.height = p.height;
      window.frameCount = p.frameCount;
      window.key = p.key;
      window.keyCode = p.keyCode;
      
      // Drawing functions - direct assignment
      window.background = p.background.bind(p);
      window.fill = p.fill.bind(p);
      window.noFill = p.noFill.bind(p);
      window.stroke = p.stroke.bind(p);
      window.noStroke = p.noStroke.bind(p);
      window.strokeWeight = p.strokeWeight.bind(p);
      
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
      
      console.log("✅ p5.js functions exposed globally using direct assignment");
    } catch (error) {
      console.error("❌ Error exposing p5.js functions:", error);
    }
  }

  // Switch to a specific project
  switchToProject(projectId) {
    if (!this.projects.has(projectId)) {
      console.error(`❌ Project not found: ${projectId}`);
      return false;
    }

    // Clean up existing canvas
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
      this.canvas = null;
    }

    // Stop current drawing if running
    this.isRunning = false;

    // Load new project
    this.currentProject = this.projects.get(projectId);
    this.setupCanvas();
    this.updateProjectInfo();
    
    console.log(`🎨 Switched to project: ${this.currentProject.name}`);
    return true;
  }

  // Setup canvas for current project
  setupCanvas() {
    if (!this.currentProject) return;

    // Check if canvas wrapper exists
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (!canvasWrapper) {
      console.error('❌ Canvas wrapper not found!');
      return;
    }

    const { width, height } = this.currentProject.canvasSize;
    
    // Clean up existing canvas
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
      this.canvas = null;
    }

    // Clear canvas wrapper
    canvasWrapper.innerHTML = '';
    
    // Create new p5 instance in instance mode
    const sketch = (p) => {
      p.setup = () => {
        this.canvas = p.createCanvas(width, height);
        
        // Make p5 functions and variables globally accessible
        this.exposeP5Globals(p);
        
        // Wait a bit for functions to be exposed
        setTimeout(() => {
          // Call the project setup function
          this.currentProject.setup();
          this.isRunning = true;
          console.log(`✅ Canvas created for ${this.currentProject.name}: ${width}x${height}`);
        }, 10);
      };
      
      p.draw = () => {
        if (this.isRunning && this.currentProject) {
          // Make p5 functions and variables globally accessible
          this.exposeP5Globals(p);
          
          // Only draw if functions are available
          if (typeof window.background === 'function') {
            this.currentProject.draw();
          } else {
            console.warn('⚠️ p5.js functions not available in draw loop');
          }
        }
      };

      p.mousePressed = () => {
        if (this.currentProject && this.currentProject.mousePressed) {
          // Make p5 variables accessible
          this.exposeP5Globals(p);
          
          this.currentProject.mousePressed();
        }
      };

      p.keyPressed = () => {
        if (this.currentProject && this.currentProject.keyPressed) {
          // Make p5 variables accessible
          this.exposeP5Globals(p);
          
          this.currentProject.keyPressed();
        }
      };
      
      p.windowResized = () => {
        if (this.currentProject && this.currentProject.windowResized) {
          // Pass the p5 instance to the windowResized function
          this.currentProject.windowResized(p);
        }
      };
    };
    
    // Initialize new p5 instance
    this.p5Instance = new p5(sketch, canvasWrapper);
  }

  // Update project information display
  updateProjectInfo() {
    const infoElement = document.getElementById('project-info');
    if (infoElement && this.currentProject) {
      infoElement.innerHTML = `
        <h3>${this.currentProject.name}</h3>
        <p>${this.currentProject.description}</p>
      `;
    }
  }

  // Get all registered projects
  getAllProjects() {
    return Array.from(this.projects.values());
  }

  // Get current project information
  getCurrentProject() {
    return this.currentProject;
  }
}

// Global project manager instance
const projectManager = new ProjectManager();

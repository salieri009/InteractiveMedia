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
  }

  // Expose p5.js functions and variables globally
  exposeP5Globals(p) {
    // Store p5 instance
    window.p5Instance = p;
    
    // Variables
    window.mouseX = p.mouseX;
    window.mouseY = p.mouseY;
    window.pmouseX = p.pmouseX;
    window.pmouseY = p.pmouseY;
    window.width = p.width;
    window.height = p.height;
    window.frameCount = p.frameCount;
    window.key = p.key;
    window.keyCode = p.keyCode;
    
    // Drawing functions
    window.background = (...args) => p.background(...args);
    window.fill = (...args) => p.fill(...args);
    window.noFill = () => p.noFill();
    window.stroke = (...args) => p.stroke(...args);
    window.noStroke = () => p.noStroke();
    window.strokeWeight = (weight) => p.strokeWeight(weight);
    
    // Shape functions
    window.circle = (x, y, d) => p.circle(x, y, d);
    window.ellipse = (x, y, w, h) => p.ellipse(x, y, w, h);
    window.rect = (x, y, w, h) => p.rect(x, y, w, h);
    window.square = (x, y, s) => p.square(x, y, s);
    window.line = (x1, y1, x2, y2) => p.line(x1, y1, x2, y2);
    window.point = (x, y) => p.point(x, y);
    window.triangle = (x1, y1, x2, y2, x3, y3) => p.triangle(x1, y1, x2, y2, x3, y3);
    
    // Transform functions
    window.push = () => p.push();
    window.pop = () => p.pop();
    window.translate = (x, y) => p.translate(x, y);
    window.rotate = (angle) => p.rotate(angle);
    window.scale = (s) => p.scale(s);
    
    // Math functions and constants
    window.PI = p.PI;
    window.TWO_PI = p.TWO_PI;
    window.HALF_PI = p.HALF_PI;
    window.sin = (angle) => p.sin(angle);
    window.cos = (angle) => p.cos(angle);
    window.tan = (angle) => p.tan(angle);
    window.map = (value, start1, stop1, start2, stop2) => p.map(value, start1, stop1, start2, stop2);
    window.constrain = (n, low, high) => p.constrain(n, low, high);
    window.dist = (x1, y1, x2, y2) => p.dist(x1, y1, x2, y2);
    window.min = (...args) => p.min(...args);
    window.max = (...args) => p.max(...args);
    window.random = (...args) => p.random(...args);
    
    // Loop control
    window.noLoop = () => p.noLoop();
    window.loop = () => p.loop();
    
    // Text functions
    window.text = (str, x, y) => p.text(str, x, y);
    window.textAlign = (...args) => p.textAlign(...args);
    window.textSize = (size) => p.textSize(size);
    
    // Color mode
    window.colorMode = (...args) => p.colorMode(...args);
    window.HSB = p.HSB;
    window.RGB = p.RGB;
    
    // Constants
    window.LEFT = p.LEFT;
    window.RIGHT = p.RIGHT;
    window.CENTER = p.CENTER;
    window.TOP = p.TOP;
    window.BOTTOM = p.BOTTOM;
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
        
        // Call the project setup function
        this.currentProject.setup();
        this.isRunning = true;
        console.log(`✅ Canvas created for ${this.currentProject.name}: ${width}x${height}`);
      };
      
      p.draw = () => {
        if (this.isRunning && this.currentProject) {
          // Make p5 functions and variables globally accessible
          this.exposeP5Globals(p);
          
          this.currentProject.draw();
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

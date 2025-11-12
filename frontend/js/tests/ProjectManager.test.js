/**
 * ===============================================
 * ProjectManager Test Suite
 * ===============================================
 * 
 * Comprehensive test cases for ProjectManager class.
 * Tests project registration, switching, and lifecycle management.
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */

// Mock p5.js for testing
if (typeof p5 === 'undefined') {
  window.p5 = class MockP5 {
    constructor(sketch, parent) {
      this.width = 400;
      this.height = 400;
      this.mouseX = 0;
      this.mouseY = 0;
      this.frameCount = 0;
      this.setup = () => {};
      this.draw = () => {};
      this.mousePressed = () => {};
      this.keyPressed = () => {};
      this.windowResized = () => {};
      
      if (sketch) {
        const p = this;
        sketch(p);
      }
    }
    
    createCanvas(w, h) {
      this.width = w;
      this.height = h;
      return { parent: () => {} };
    }
    
    remove() {}
    noLoop() {}
    loop() {}
    
    // Mock p5 functions
    background() {}
    fill() {}
    stroke() {}
    circle() {}
    rect() {}
  };
}

/**
 * Test Suite: Project Registration
 */
describe('ProjectManager - Project Registration', () => {
  let manager;
  
  beforeEach(() => {
    manager = new ProjectManager();
  });
  
  afterEach(() => {
    if (manager.p5Instance) {
      manager.cleanupP5Instance();
    }
  });
  
  test('should register a valid project', () => {
    const setupFn = jest.fn();
    const drawFn = jest.fn();
    
    const result = manager.registerProject(
      'test-project',
      'Test Project',
      setupFn,
      drawFn,
      {
        description: 'A test project',
        canvasSize: { width: 400, height: 400 }
      }
    );
    
    expect(result).toBe(true);
    expect(manager.hasProject('test-project')).toBe(true);
    expect(manager.getProjectCount()).toBe(1);
  });
  
  test('should reject invalid project ID', () => {
    const result = manager.registerProject(
      null,
      'Test Project',
      jest.fn(),
      jest.fn()
    );
    
    expect(result).toBe(false);
    expect(manager.getProjectCount()).toBe(0);
  });
  
  test('should reject invalid project name', () => {
    const result = manager.registerProject(
      'test-project',
      null,
      jest.fn(),
      jest.fn()
    );
    
    expect(result).toBe(false);
  });
  
  test('should reject non-function setup', () => {
    const result = manager.registerProject(
      'test-project',
      'Test Project',
      'not-a-function',
      jest.fn()
    );
    
    expect(result).toBe(false);
  });
  
  test('should use default canvas size if invalid', () => {
    const result = manager.registerProject(
      'test-project',
      'Test Project',
      jest.fn(),
      jest.fn(),
      {
        canvasSize: { width: -1, height: 0 }
      }
    );
    
    expect(result).toBe(true);
    const project = manager.projects.get('test-project');
    expect(project.canvasSize.width).toBe(400);
    expect(project.canvasSize.height).toBe(400);
  });
});

/**
 * Test Suite: Project Switching
 */
describe('ProjectManager - Project Switching', () => {
  let manager;
  
  beforeEach(() => {
    manager = new ProjectManager();
    
    // Register test projects
    manager.registerProject('project1', 'Project 1', jest.fn(), jest.fn());
    manager.registerProject('project2', 'Project 2', jest.fn(), jest.fn(), {
      cleanup: jest.fn()
    });
  });
  
  afterEach(() => {
    if (manager.p5Instance) {
      manager.cleanupP5Instance();
    }
  });
  
  test('should switch to existing project', () => {
    const result = manager.switchToProject('project1');
    
    expect(result).toBe(true);
    expect(manager.getCurrentProject().id).toBe('project1');
  });
  
  test('should reject switching to non-existent project', () => {
    const result = manager.switchToProject('non-existent');
    
    expect(result).toBe(false);
    expect(manager.getCurrentProject()).toBeNull();
  });
  
  test('should call cleanup on previous project', () => {
    const cleanupFn = jest.fn();
    manager.registerProject('project3', 'Project 3', jest.fn(), jest.fn(), {
      cleanup: cleanupFn
    });
    
    manager.switchToProject('project3');
    manager.switchToProject('project1');
    
    expect(cleanupFn).toHaveBeenCalled();
  });
  
  test('should handle cleanup errors gracefully', () => {
    const cleanupFn = jest.fn(() => {
      throw new Error('Cleanup error');
    });
    
    manager.registerProject('project4', 'Project 4', jest.fn(), jest.fn(), {
      cleanup: cleanupFn
    });
    
    manager.switchToProject('project4');
    expect(() => manager.switchToProject('project1')).not.toThrow();
  });
});

/**
 * Test Suite: Project Information
 */
describe('ProjectManager - Project Information', () => {
  let manager;
  
  beforeEach(() => {
    manager = new ProjectManager();
    manager.registerProject('test', 'Test', jest.fn(), jest.fn());
  });
  
  test('should get all projects', () => {
    const projects = manager.getAllProjects();
    
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe('test');
  });
  
  test('should get current project', () => {
    manager.switchToProject('test');
    const current = manager.getCurrentProject();
    
    expect(current).not.toBeNull();
    expect(current.id).toBe('test');
  });
  
  test('should return null for current project when none active', () => {
    const current = manager.getCurrentProject();
    expect(current).toBeNull();
  });
  
  test('should check if project exists', () => {
    expect(manager.hasProject('test')).toBe(true);
    expect(manager.hasProject('non-existent')).toBe(false);
  });
  
  test('should get project count', () => {
    expect(manager.getProjectCount()).toBe(1);
    
    manager.registerProject('test2', 'Test 2', jest.fn(), jest.fn());
    expect(manager.getProjectCount()).toBe(2);
  });
});

/**
 * Test Suite: HTML Escaping (Security)
 */
describe('ProjectManager - Security', () => {
  let manager;
  
  beforeEach(() => {
    manager = new ProjectManager();
    
    // Mock DOM
    document.body.innerHTML = '<div id="project-info"></div>';
  });
  
  test('should escape HTML in project names', () => {
    manager.registerProject(
      'xss-test',
      '<script>alert("xss")</script>',
      jest.fn(),
      jest.fn()
    );
    
    manager.switchToProject('xss-test');
    manager.updateProjectInfo();
    
    const infoElement = document.getElementById('project-info');
    expect(infoElement.innerHTML).not.toContain('<script>');
  });
});


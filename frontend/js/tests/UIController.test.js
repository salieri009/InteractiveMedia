/**
 * ===============================================
 * UIController Test Suite
 * ===============================================
 * 
 * Comprehensive test cases for UIController class.
 * Tests UI initialization, button creation, and project switching.
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */

// Mock DOM
document.body.innerHTML = `
  <div id="project-buttons"></div>
  <div id="control-panel"></div>
  <div id="project-info"></div>
  <div id="canvas-wrapper"></div>
`;

describe('UIController - Initialization', () => {
  let controller;
  
  beforeEach(() => {
    controller = new UIController();
    // Clear project manager
    projectManager.projects.clear();
    projectManager.currentProject = null;
  });
  
  test('should initialize UI', () => {
    controller.initialize();
    
    expect(controller.initialized).toBe(true);
  });
  
  test('should not reinitialize if already initialized', () => {
    controller.initialized = true;
    const createButtonsSpy = jest.spyOn(controller, 'createProjectButtons');
    
    controller.initialize();
    
    expect(createButtonsSpy).not.toHaveBeenCalled();
  });
});

describe('UIController - Button Creation', () => {
  let controller;
  
  beforeEach(() => {
    controller = new UIController();
    projectManager.projects.clear();
    
    // Register test projects
    projectManager.registerProject('test1', 'Test 1', jest.fn(), jest.fn());
    projectManager.registerProject('test2', 'Test 2', jest.fn(), jest.fn());
  });
  
  test('should create buttons for registered projects', () => {
    controller.createProjectButtons();
    
    const buttons = document.querySelectorAll('.project-btn');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
  
  test('should handle missing button container gracefully', () => {
    document.getElementById('project-buttons').remove();
    
    expect(() => controller.createProjectButtons()).not.toThrow();
  });
});

describe('UIController - ensureAllButtonsExist Bug Fix', () => {
  let controller;
  
  beforeEach(() => {
    controller = new UIController();
    projectManager.projects.clear();
    
    // Register a project
    projectManager.registerProject('dynamic-project', 'Dynamic Project', jest.fn(), jest.fn());
  });
  
  test('should check buttons dynamically from ProjectManager', () => {
    // BUGFIX: Should not use hardcoded project IDs
    controller.createProjectButtons();
    controller.projectButtons.clear(); // Simulate missing button
    
    const createButtonsSpy = jest.spyOn(controller, 'createProjectButtons');
    controller.ensureAllButtonsExist();
    
    expect(createButtonsSpy).toHaveBeenCalled();
  });
  
  test('should work with any registered projects', () => {
    // Add a new project dynamically
    projectManager.registerProject('new-project', 'New Project', jest.fn(), jest.fn());
    
    controller.createProjectButtons();
    expect(controller.projectButtons.has('new-project')).toBe(true);
  });
});

describe('UIController - Project Switching', () => {
  let controller;
  
  beforeEach(() => {
    controller = new UIController();
    projectManager.projects.clear();
    projectManager.registerProject('test', 'Test', jest.fn(), jest.fn());
  });
  
  test('should switch project successfully', () => {
    const switchSpy = jest.spyOn(projectManager, 'switchToProject');
    switchSpy.mockReturnValue(true);
    
    const result = controller.switchProject('test');
    
    expect(result).toBe(true);
    expect(switchSpy).toHaveBeenCalledWith('test');
  });
  
  test('should update active button style', () => {
    controller.createProjectButtons();
    controller.switchProject('test');
    
    const activeButton = document.querySelector('.project-btn.active');
    expect(activeButton).not.toBeNull();
  });
});

describe('UIController - Control Panel', () => {
  let controller;
  
  beforeEach(() => {
    controller = new UIController();
  });
  
  test('should create control panel', () => {
    controller.createControlPanel();
    
    const reloadBtn = document.getElementById('reload-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    expect(reloadBtn).not.toBeNull();
    expect(fullscreenBtn).not.toBeNull();
  });
  
  test('should handle control panel errors gracefully', () => {
    document.getElementById('control-panel').remove();
    
    expect(() => controller.createControlPanel()).not.toThrow();
  });
});


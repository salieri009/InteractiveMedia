// ===============================================
// Project Template - New Project Template
// Copy this file to create new projects
// ===============================================

// [PROJECT_ID] project variables (if needed)
// let variable1 = 0;
// let variable2 = false;

// [PROJECT_ID] project functions
function setupPROJECTID() {
  console.log("🎨 [PROJECT_NAME] project initialized!");
  
  // Write your initial setup code here
}

function drawPROJECTID() {
  // Set background
  background(220);
  
  // Write your drawing code here
  
  // Example: simple shape
  fill(255, 100, 100);
  ellipse(200, 200, 100);
}

// ===============================================
// Helper Functions (if needed)
// ===============================================

function helperPROJECTIDFunction() {
  // Write your helper functions here
}

// ===============================================
// Interactive Functions
// ===============================================

function mousePressedPROJECTID() {
  console.log(`[PROJECT_ID] - Mouse clicked at: (${mouseX}, ${mouseY})`);
  // Handle mouse click events
}

function keyPressedPROJECTID() {
  console.log(`[PROJECT_ID] - Key pressed: ${key}`);
  // Handle keyboard input events
}

// ===============================================
// Project Registration
// ===============================================

// Register new project with project manager
if (typeof projectManager !== 'undefined') {
  projectManager.registerProject(
    '[PROJECT_ID]',           // Project unique ID (lowercase, use hyphens)
    '[PROJECT_NAME]',         // Project display name
    setupPROJECTID,          // setup function
    drawPROJECTID,           // draw function
    {
      mousePressed: mousePressedPROJECTID,
      keyPressed: keyPressedPROJECTID,
      description: '[PROJECT_DESCRIPTION]',  // Project description
      canvasSize: { width: 400, height: 400 }  // Canvas size
    }
  );
}

/*
===============================================
Creating New Projects Guide:

1. Copy this file and save with new name (e.g., A1C.js)

2. Replace the following items:
   - [PROJECT_ID] → actual project ID (e.g., a1c)
   - [PROJECT_NAME] → project name (e.g., A1C - Particle System)
   - [PROJECT_DESCRIPTION] → project description
   - PROJECTID → actual project ID without brackets (e.g., A1C)

3. Implement setup, draw, and interaction functions

4. Add new script tag to index.html:
   <script src="js/[newfilename].js"></script>

5. Refresh the page and buttons will be generated automatically!
===============================================
*/

/**
 * Project Template ??Copy this file to create a new project.
 *
 * Steps:
 *  1. Copy and rename to A1X.ts (replace X with your letter/number)
 *  2. Replace all occurrences of PROJECTID with your project identifier (e.g. A1X)
 *  3. Update the registration block at the bottom (id, name, description, canvasSize)
 *  4. Implement setup, draw, and interaction functions
 *  5. Add a <script type="module" src="./src/projects/A1X.ts"> tag in index.html
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Module variables (rename with project prefix, e.g. a1x_)
   ================================================================ */

// let a1x_variable1 = 0;
// let a1x_variable2 = false;

/* ================================================================
   Setup
   ================================================================ */

/**
 * Called once when this project is activated.
 * ProjectManager creates the canvas before calling this ??do not call createCanvas().
 */
function setupPROJECTID(): void {
  console.log('PROJECTID project initialized');
  // Write your setup code here
}

/* ================================================================
   Draw
   ================================================================ */

/**
 * Called every frame while this project is active.
 * Keep drawing logic efficient ??this runs at ~60 fps.
 */
function drawPROJECTID(): void {
  background(220);

  // Write your drawing code here

  // Example: simple shape
  fill(255, 100, 100);
  ellipse(200, 200, 100, 100);
}

/* ================================================================
   Interaction handlers
   ================================================================ */

/** Called when the user presses a mouse button over the canvas. */
function mousePressedPROJECTID(): void {
  console.log(`PROJECTID - mouse at (${mouseX}, ${mouseY})`);
}

/** Called when the user presses a key. */
function keyPressedPROJECTID(): void {
  console.log(`PROJECTID - key: ${key}`);
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  '[project-id]',   // unique lowercase id, e.g. 'a1x'
  '[Project Name]', // display name shown in sidebar
  setupPROJECTID,
  drawPROJECTID,
  {
    mousePressed: mousePressedPROJECTID,
    keyPressed:   keyPressedPROJECTID,
    description:  '[Project description ??one sentence shown in the info panel]',
    canvasSize:   { width: 400, height: 400 },
  }
);

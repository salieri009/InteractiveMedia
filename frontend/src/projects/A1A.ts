/**
 * A1A ??Basic Shapes Demo
 *
 * A static canvas demonstrating fundamental p5.js shape primitives:
 * line, square, circle, and rectangle with varied colours.
 * The draw loop is stopped after the first frame (noLoop) to produce
 * a still image ??this is intentional.
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Setup
   ================================================================ */

function setupA1A(): void {
  console.log('A1A project setup started');
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1A(): void {
  window.background(220);
  drawBasicShapes();

  /* Static image ??stop loop after the first rendered frame */
  window.noLoop();
}

/* ================================================================
   Helpers
   ================================================================ */

/** Renders the four fundamental p5 shape primitives. */
function drawBasicShapes(): void {
  // Line from origin to (100, 100)
  window.stroke(0);
  window.strokeWeight(2);
  window.line(0, 0, 100, 100);

  // Square at (100, 100) with side 50
  window.fill(150, 200, 255);
  window.square(100, 100, 50);

  // Circle at (200, 200) with diameter 25
  window.fill(255, 150, 150);
  window.circle(200, 200, 25);

  // Rectangle at (10, 25) sized 50 × 50
  window.fill(150, 255, 150);
  window.rect(10, 25, 50, 50);
}

/* ================================================================
   Interaction handlers
   ================================================================ */

function mousePressedA1A(): void {
  console.log(`A1A - mouse at (${window.mouseX}, ${window.mouseY})`);
}

function keyPressedA1A(): void {
  console.log(`A1A - key: ${window.key}`);
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1a',
  'A1A - Basic Shapes',
  setupA1A,
  drawA1A,
  {
    mousePressed: mousePressedA1A,
    keyPressed:   keyPressedA1A,
    description:  'A basic project demonstrating fundamental shapes drawing.',
    canvasSize:   { width: 400, height: 400 },
  }
);

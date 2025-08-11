// ===============================================
// Project A1B - Interactive Animation
// Interactive Media Assignment - A1B.js
// UTS 2025 Semester 2
// ===============================================

// A1B project variables
let circleX = 200;
let circleY = 200;
let circleSpeedX = 3;
let circleSpeedY = 2;
let circleSize = 50;
let backgroundColor = 100;

// A1B project functions
function setupA1B() {
  console.log("🎨 A1B project initialized!");
  circleX = 200;
  circleY = 200;
  circleSpeedX = 3;
  circleSpeedY = 2;
}

function drawA1B() {
  // Dynamic background
  background(backgroundColor);
  
  // Moving circle
  drawMovingCircle();
  
  // Mouse trail
  drawMouseTrail();
  
  // Information display
  drawInfo();
}

// ===============================================
// A1B Helper Functions
// ===============================================

function drawMovingCircle() {
  // Update circle position
  circleX += circleSpeedX;
  circleY += circleSpeedY;
  
  // Bounce off walls
  if (circleX > width - circleSize/2 || circleX < circleSize/2) {
    circleSpeedX *= -1;
  }
  if (circleY > height - circleSize/2 || circleY < circleSize/2) {
    circleSpeedY *= -1;
  }
  
  // Draw circle
  fill(255, 100, 100, 150);
  stroke(255);
  strokeWeight(2);
  ellipse(circleX, circleY, circleSize);
}

function drawMouseTrail() {
  // Draw line to mouse position
  stroke(255, 255, 100);
  strokeWeight(1);
  line(circleX, circleY, mouseX, mouseY);
  
  // Small circle at mouse position
  fill(255, 255, 100);
  noStroke();
  ellipse(mouseX, mouseY, 10);
}

function drawInfo() {
  // Information text
  fill(255);
  textSize(12);
  text(`Circle: (${int(circleX)}, ${int(circleY)})`, 10, 20);
  text(`Mouse: (${mouseX}, ${mouseY})`, 10, 35);
  text('Click: Change color, Space: Speed up', 10, height - 10);
}

// ===============================================
// A1B Interactive Functions
// ===============================================

function mousePressedA1B() {
  // Random background color change
  backgroundColor = random(50, 200);
  console.log(`A1B - Background color changed: ${backgroundColor}`);
}

function keyPressedA1B() {
  if (key === ' ') {
    // Speed up with spacebar
    circleSpeedX *= 1.2;
    circleSpeedY *= 1.2;
    console.log('A1B - Speed increased!');
  } else if (key === 'r') {
    // Reset with R key
    setupA1B();
    console.log('A1B - Reset');
  }
}

// ===============================================
// Project Registration
// ===============================================

// Register A1B project with project manager
if (typeof projectManager !== 'undefined') {
  projectManager.registerProject(
    'a1b',
    'A1B - Interactive Animation',
    setupA1B,
    drawA1B,
    {
      mousePressed: mousePressedA1B,
      keyPressed: keyPressedA1B,
      description: 'An animated project with moving circle and mouse interaction.',
      canvasSize: { width: 400, height: 400 }
    }
  );
}

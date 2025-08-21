// ===============================================
// Project A1A - Basic Shapes Demo
// Interactive Media Assignment - A1A.js
// UTS 2025 Semester 2
// ===============================================

// A1A project functions
function setupA1A() {
  console.log("🎨 A1A project setup started!");
  
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js not loaded! background function not available.');
    return;
  }
  
  // Additional check for other essential functions
  if (typeof window.fill === 'undefined' || typeof window.stroke === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }
  
  // ProjectManager already creates the canvas, so we don't need to call createCanvas
  console.log("✅ A1A project initialized successfully!");
}

function drawA1A() {
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1A!');
    return;
  }

  // Additional check for drawing functions
  if (typeof window.fill === 'undefined' || typeof window.stroke === 'undefined') {
    console.error('❌ p5.js drawing functions not available in drawA1A!');
    return;
  }

  // Clear background with light gray
  window.background(220);
  
  // Basic shapes demonstration
  drawBasicShapes();
  
  // Stop the draw loop after first frame (static image)
  if (typeof window.noLoop === 'function') {
    window.noLoop();
    console.log("✅ A1A drawing completed, loop stopped");
  } else {
    console.log("⚠️ noLoop function not available");
  }
}

// ===============================================
// Helper Functions
// ===============================================

function drawBasicShapes() {
  // Check if p5.js drawing functions are available
  if (typeof window.stroke === 'undefined' || typeof window.fill === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }

  // Line from (0,0) to (100,100)
  window.stroke(0);
  window.strokeWeight(2);
  window.line(0, 0, 100, 100);
  
  // Square at (100,100) with size 50
  window.fill(150, 200, 255);
  window.square(100, 100, 50);
  
  // Circle at (200,200) with diameter 25
  window.fill(255, 150, 150);
  window.circle(200, 200, 25);
  
  // Rectangle at (10,25) with width 50, height 50
  window.fill(150, 255, 150);
  window.rect(10, 25, 50, 50);
}

// ===============================================
// Interactive Functions
// ===============================================

function mousePressedA1A() {
  // Check if mouseX and mouseY are available
  if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
    console.log(`A1A - Mouse clicked at: (${mouseX}, ${mouseY})`);
  } else {
    console.log('A1A - Mouse clicked (coordinates not available)');
  }
}

function keyPressedA1A() {
  // Check if key is available
  if (typeof key !== 'undefined' && key !== null) {
    console.log(`A1A - Key pressed: ${key}`);
  } else {
    console.log('A1A - Key pressed (key not available)');
  }
}

// ===============================================
// Project Registration
// ===============================================

// Register A1A project with project manager
if (typeof projectManager !== 'undefined') {
  console.log('📝 Registering A1A project...');
  projectManager.registerProject(
    'a1a',
    'A1A - Basic Shapes',
    setupA1A,
    drawA1A,
    {
      mousePressed: mousePressedA1A,
      keyPressed: keyPressedA1A,
      description: 'A basic project demonstrating fundamental shapes drawing.',
      canvasSize: { width: 400, height: 400 }
    }
  );
  console.log('✅ A1A project registered successfully!');
} else {
  console.error('❌ ProjectManager not found! A1A project not registered.');
}
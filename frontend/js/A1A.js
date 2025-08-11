// ===============================================
// Project A1A - Basic Shapes Demo
// Interactive Media Assignment - A1A.js
// UTS 2025 Semester 2
// ===============================================

// A1A project functions
function setupA1A() {
  console.log("🎨 A1A project setup started!");
  
  // Check if p5.js functions are available
  if (typeof createCanvas === 'undefined') {
    console.error('❌ p5.js not loaded! createCanvas function not available.');
    return;
  }
  
  console.log("✅ A1A project initialized successfully!");
}

function drawA1A() {
  // Check if p5.js functions are available
  if (typeof background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1A!');
    return;
  }

  // Clear background with light gray
  background(220);
  
  // Basic shapes demonstration
  drawBasicShapes();
  
  // Stop the draw loop after first frame (static image)
  if (typeof noLoop === 'function') {
    noLoop();
  }
}

// ===============================================
// Helper Functions
// ===============================================

function drawBasicShapes() {
  // Check if p5.js drawing functions are available
  if (typeof stroke === 'undefined' || typeof fill === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }

  // Line from (0,0) to (100,100)
  stroke(0);
  strokeWeight(2);
  line(0, 0, 100, 100);
  
  // Square at (100,100) with size 50
  fill(150, 200, 255);
  square(100, 100, 50);
  
  // Circle at (200,200) with diameter 25
  fill(255, 150, 150);
  circle(200, 200, 25);
  
  // Rectangle at (10,25) with width 50, height 50
  fill(150, 255, 150);
  rect(10, 25, 50, 50);
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
  if (typeof key !== 'undefined') {
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
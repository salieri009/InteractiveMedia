// ===============================================
// Project A1C - Interactive Pattern Generator
// Interactive Media Assignment - A1C.js
// UTS 2025 Semester 2
// ===============================================

// A1C project variables
let patternType = 0;
let currentColorMode = 0;
let shapeSize = 30;
let spacing = 40;
let rotationAngle = 0;
let animationSpeed = 0.02;

// A1C project functions
function setupA1C() {
  console.log("🎨 A1C project - Pattern Generator initialized!");
  
  // Check if p5.js functions are available
  if (typeof createCanvas === 'undefined') {
    console.error('❌ p5.js not loaded! createCanvas function not available.');
    return;
  }
  
  // Reset variables
  patternType = 0;
  currentColorMode = 0;
  shapeSize = 30;
  spacing = 40;
  rotationAngle = 0;
  
  console.log("✅ A1C project initialized successfully!");
}

function drawA1C() {
  // Check if p5.js functions are available
  if (typeof background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1C!');
    return;
  }

  // Dark background
  background(20, 25, 40);
  
  // Update animation
  rotationAngle += animationSpeed;
  
  // Draw pattern based on current mode
  drawPattern();
  
  // Draw UI info
  drawPatternInfo();
}

// ===============================================
// A1C Helper Functions
// ===============================================

function drawPattern() {
  // Check if p5.js drawing functions are available
  if (typeof stroke === 'undefined' || typeof fill === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }

  push();
  translate(width/2, height/2);
  
  // Different pattern types
  switch(patternType) {
    case 0:
      drawCircularPattern();
      break;
    case 1:
      drawGridPattern();
      break;
    case 2:
      drawSpiralPattern();
      break;
    case 3:
      drawRadialPattern();
      break;
  }
  
  pop();
}

function drawCircularPattern() {
  let numShapes = 8;
  let radius = 80;
  
  for(let i = 0; i < numShapes; i++) {
    let angle = (TWO_PI / numShapes) * i + rotationAngle;
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    
    push();
    translate(x, y);
    rotate(rotationAngle * 2);
    
    setPatternColor(i);
    drawShape(shapeSize);
    
    pop();
  }
}

function drawGridPattern() {
  let cols = 6;
  let rows = 6;
  let startX = -spacing * (cols-1) / 2;
  let startY = -spacing * (rows-1) / 2;
  
  for(let i = 0; i < cols; i++) {
    for(let j = 0; j < rows; j++) {
      let x = startX + i * spacing;
      let y = startY + j * spacing;
      
      push();
      translate(x, y);
      rotate(rotationAngle + (i + j) * 0.2);
      
      setPatternColor(i + j);
      drawShape(shapeSize * (0.5 + sin(rotationAngle + i + j) * 0.3));
      
      pop();
    }
  }
}

function drawSpiralPattern() {
  let numPoints = 50;
  let maxRadius = 120;
  
  for(let i = 0; i < numPoints; i++) {
    let t = i / numPoints;
    let angle = t * TWO_PI * 3 + rotationAngle;
    let radius = t * maxRadius;
    
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    
    push();
    translate(x, y);
    rotate(angle);
    
    setPatternColor(i);
    drawShape(shapeSize * (1 - t * 0.5));
    
    pop();
  }
}

function drawRadialPattern() {
  let numRings = 4;
  let numShapesPerRing = 8;
  
  for(let ring = 0; ring < numRings; ring++) {
    let radius = (ring + 1) * 40;
    let shapesInRing = numShapesPerRing + ring * 2;
    
    for(let i = 0; i < shapesInRing; i++) {
      let angle = (TWO_PI / shapesInRing) * i + rotationAngle * (ring + 1);
      let x = cos(angle) * radius;
      let y = sin(angle) * radius;
      
      push();
      translate(x, y);
      rotate(angle + rotationAngle);
      
      setPatternColor(ring * 10 + i);
      drawShape(shapeSize * (1 - ring * 0.2));
      
      pop();
    }
  }
}

function setPatternColor(index) {
  switch(currentColorMode) {
    case 0: // Rainbow
      colorMode(HSB, 360, 100, 100);
      fill((index * 30 + frameCount) % 360, 80, 90);
      stroke((index * 30 + frameCount) % 360, 80, 60);
      break;
    case 1: // Blue theme
      colorMode(RGB, 255);
      fill(100 + index * 20, 150 + index * 10, 255, 180);
      stroke(50 + index * 10, 100 + index * 5, 200);
      break;
    case 2: // Warm theme
      colorMode(RGB, 255);
      fill(255, 150 - index * 10, 50 + index * 20, 180);
      stroke(200, 100 - index * 5, 30 + index * 10);
      break;
    case 3: // Monochrome
      colorMode(RGB, 255);
      let gray = 100 + index * 15;
      fill(gray, gray, gray + 50, 180);
      stroke(gray - 30, gray - 30, gray);
      break;
  }
  strokeWeight(2);
}

function drawShape(size) {
  switch(patternType) {
    case 0:
    case 2:
      ellipse(0, 0, size, size);
      break;
    case 1:
      rect(-size/2, -size/2, size, size);
      break;
    case 3:
      triangle(0, -size/2, -size/2, size/2, size/2, size/2);
      break;
  }
}

function drawPatternInfo() {
  // Reset color mode to RGB for UI
  colorMode(RGB, 255);
  fill(255, 255, 255, 200);
  noStroke();
  textAlign(LEFT);
  textSize(12);
  
  let info = [
    `Pattern: ${getPatternName()}`,
    `Color Mode: ${getColorModeName()}`,
    `Size: ${Math.round(shapeSize)}`,
    ``,
    `Controls:`,
    `1-4: Change Pattern`,
    `Q-T: Change Colors`,
    `+/-: Adjust Size`,
    `Space: Pause/Resume`,
    `R: Reset`
  ];
  
  for(let i = 0; i < info.length; i++) {
    text(info[i], 10, 20 + i * 15);
  }
}

function getPatternName() {
  const names = ['Circular', 'Grid', 'Spiral', 'Radial'];
  return names[patternType] || 'Unknown';
}

function getColorModeName() {
  const names = ['Rainbow', 'Cool Blue', 'Warm', 'Monochrome'];
  return names[currentColorMode] || 'Unknown';
}

// ===============================================
// Interactive Functions
// ===============================================

function mousePressedA1C() {
  console.log(`A1C - Mouse clicked at: (${mouseX}, ${mouseY})`);
  
  // Change pattern on mouse click
  patternType = (patternType + 1) % 4;
  console.log(`A1C - Pattern changed to: ${getPatternName()}`);
}

function keyPressedA1C() {
  console.log(`A1C - Key pressed: ${key}`);
  
  // Pattern selection (1-4)
  if (key >= '1' && key <= '4') {
    patternType = parseInt(key) - 1;
    console.log(`A1C - Pattern set to: ${getPatternName()}`);
  }
  
  // Color mode selection (Q, W, E, R)
  switch(key.toLowerCase()) {
    case 'q':
      currentColorMode = 0;
      console.log('A1C - Color mode: Rainbow');
      break;
    case 'w':
      currentColorMode = 1;
      console.log('A1C - Color mode: Cool Blue');
      break;
    case 'e':
      currentColorMode = 2;
      console.log('A1C - Color mode: Warm');
      break;
    case 't':
      currentColorMode = 3;
      console.log('A1C - Color mode: Monochrome');
      break;
    case '+':
    case '=':
      shapeSize = min(shapeSize + 5, 60);
      console.log(`A1C - Size increased to: ${shapeSize}`);
      break;
    case '-':
      shapeSize = max(shapeSize - 5, 10);
      console.log(`A1C - Size decreased to: ${shapeSize}`);
      break;
    case ' ':
      if (animationSpeed > 0) {
        animationSpeed = 0;
        console.log('A1C - Animation paused');
      } else {
        animationSpeed = 0.02;
        console.log('A1C - Animation resumed');
      }
      break;
    case 'r':
      setupA1C();
      console.log('A1C - Reset');
      break;
  }
}

// ===============================================
// Project Registration
// ===============================================

// Register A1C project with project manager
if (typeof projectManager !== 'undefined') {
  console.log('📝 Registering A1C project...');
  projectManager.registerProject(
    'a1c',
    'A1C - Pattern Generator',
    setupA1C,
    drawA1C,
    {
      mousePressed: mousePressedA1C,
      keyPressed: keyPressedA1C,
      description: 'Interactive pattern generator with multiple modes and animations.',
      canvasSize: { width: 400, height: 400 }
    }
  );
  console.log('✅ A1C project registered successfully!');
} else {
  console.error('❌ ProjectManager not found! A1C project not registered.');
}

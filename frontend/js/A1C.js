// ===============================================
// Project A1C - Interactive Pattern Generator
// Interactive Media Assignment - A1C.js
// UTS 2025 Semester 2
// ===============================================

// A1C project variables (use A1C prefix to avoid conflicts)
let a1c_patternType = 0;
let a1c_currentColorMode = 0;
let a1c_shapeSize = 30;
let a1c_spacing = 40;
let a1c_rotationAngle = 0;
let a1c_animationSpeed = 0.02;

// A1C project functions
function setupA1C() {
  console.log("🎨 A1C project - Pattern Generator initialized!");
  
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
  
  // Reset variables
  a1c_patternType = 0;
  a1c_currentColorMode = 0;
  a1c_shapeSize = 30;
  a1c_spacing = 40;
  a1c_rotationAngle = 0;
  
  console.log("✅ A1C project initialized successfully!");
}

function drawA1C() {
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1C!');
    return;
  }

  // Additional check for drawing functions
  if (typeof window.fill === 'undefined' || typeof window.stroke === 'undefined') {
    console.error('❌ p5.js drawing functions not available in drawA1C!');
    return;
  }

  // Dark background
  window.background(20, 25, 40);
  
  // Update animation
  a1c_rotationAngle += a1c_animationSpeed;
  
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
  if (typeof window.stroke === 'undefined' || typeof window.fill === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }

  window.push();
  window.translate(width/2, height/2);
  
  // Different pattern types
  switch(a1c_patternType) {
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
  
  window.pop();
}

function drawCircularPattern() {
  let numShapes = 8;
  let radius = 80;
  
  for(let i = 0; i < numShapes; i++) {
    let angle = (window.TWO_PI / numShapes) * i + a1c_rotationAngle;
    let x = window.cos(angle) * radius;
    let y = window.sin(angle) * radius;
    
    window.push();
    window.translate(x, y);
    window.rotate(a1c_rotationAngle * 2);
    
    setPatternColor(i);
    drawShape(a1c_shapeSize);
    
    window.pop();
  }
}

function drawGridPattern() {
  let cols = 6;
  let rows = 6;
  let startX = -a1c_spacing * (cols-1) / 2;
  let startY = -a1c_spacing * (rows-1) / 2;
  
  for(let i = 0; i < cols; i++) {
    for(let j = 0; j < rows; j++) {
      let x = startX + i * a1c_spacing;
      let y = startY + j * a1c_spacing;
      
      window.push();
      window.translate(x, y);
      window.rotate(a1c_rotationAngle + (i + j) * 0.2);
      
      setPatternColor(i + j);
      drawShape(a1c_shapeSize * (0.5 + window.sin(a1c_rotationAngle + i + j) * 0.3));
      
      window.pop();
    }
  }
}

function drawSpiralPattern() {
  let numPoints = 50;
  let maxRadius = 120;
  
  for(let i = 0; i < numPoints; i++) {
    let t = i / numPoints;
    let angle = t * window.TWO_PI * 3 + a1c_rotationAngle;
    let radius = t * maxRadius;
    
    let x = window.cos(angle) * radius;
    let y = window.sin(angle) * radius;
    
    window.push();
    window.translate(x, y);
    window.rotate(angle);
    
    setPatternColor(i);
    drawShape(a1c_shapeSize * (1 - t * 0.5));
    
    window.pop();
  }
}

function drawRadialPattern() {
  let numRings = 4;
  let numShapesPerRing = 8;
  
  for(let ring = 0; ring < numRings; ring++) {
    let radius = (ring + 1) * 40;
    let shapesInRing = numShapesPerRing + ring * 2;
    
    for(let i = 0; i < shapesInRing; i++) {
      let angle = (window.TWO_PI / shapesInRing) * i + a1c_rotationAngle * (ring + 1);
      let x = window.cos(angle) * radius;
      let y = window.sin(angle) * radius;
      
      window.push();
      window.translate(x, y);
      window.rotate(angle + a1c_rotationAngle);
      
      setPatternColor(ring * 10 + i);
      drawShape(a1c_shapeSize * (1 - ring * 0.2));
      
      window.pop();
    }
  }
}

function setPatternColor(index) {
  switch(a1c_currentColorMode) {
    case 0: // Rainbow
      window.colorMode(window.HSB, 360, 100, 100);
      window.fill((index * 30 + frameCount) % 360, 80, 90);
      window.stroke((index * 30 + frameCount) % 360, 80, 60);
      break;
    case 1: // Blue theme
      window.colorMode(window.RGB, 255);
      window.fill(100 + index * 20, 150 + index * 10, 255, 180);
      window.stroke(50 + index * 10, 100 + index * 5, 200);
      break;
    case 2: // Warm theme
      window.colorMode(window.RGB, 255);
      window.fill(255, 150 - index * 10, 50 + index * 20, 180);
      window.stroke(200, 100 - index * 5, 30 + index * 10);
      break;
    case 3: // Monochrome
      window.colorMode(window.RGB, 255);
      let gray = 100 + index * 15;
      window.fill(gray, gray, gray + 50, 180);
      window.stroke(gray - 30, gray - 30, gray);
      break;
  }
  window.strokeWeight(2);
}

function drawShape(size) {
  switch(a1c_patternType) {
    case 0:
    case 2:
      window.ellipse(0, 0, size, size);
      break;
    case 1:
      window.rect(-size/2, -size/2, size, size);
      break;
    case 3:
      window.triangle(0, -size/2, -size/2, size/2, size/2, size/2);
      break;
  }
}

function drawPatternInfo() {
  // Reset color mode to RGB for UI
  window.colorMode(window.RGB, 255);
  window.fill(255, 255, 255, 200);
  window.noStroke();
  window.textAlign(window.LEFT);
  window.textSize(12);
  
  let info = [
    `Pattern: ${getPatternName()}`,
    `Color Mode: ${getColorModeName()}`,
    `Size: ${Math.round(a1c_shapeSize)}`,
    ``,
    `Controls:`,
    `1-4: Change Pattern`,
    `Q-T: Change Colors`,
    `+/-: Adjust Size`,
    `Space: Pause/Resume`,
    `R: Reset`
  ];
  
  for(let i = 0; i < info.length; i++) {
    window.text(info[i], 10, 20 + i * 15);
  }
}

function getPatternName() {
  const names = ['Circular', 'Grid', 'Spiral', 'Radial'];
  return names[a1c_patternType] || 'Unknown';
}

function getColorModeName() {
  const names = ['Rainbow', 'Cool Blue', 'Warm', 'Monochrome'];
  return names[a1c_currentColorMode] || 'Unknown';
}

// ===============================================
// Interactive Functions
// ===============================================

function mousePressedA1C() {
  // Check if mouseX and mouseY are available
  if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
    console.log(`A1C - Mouse clicked at: (${mouseX}, ${mouseY})`);
  } else {
    console.log('A1C - Mouse clicked (coordinates not available)');
  }
  
  // Change pattern on mouse click
  a1c_patternType = (a1c_patternType + 1) % 4;
  console.log(`A1C - Pattern changed to: ${getPatternName()}`);
}

function keyPressedA1C() {
  // Check if key is available
  if (typeof key === 'undefined' || key === null) {
    console.log('A1C - Key pressed (key not available)');
    return;
  }
  
  console.log(`A1C - Key pressed: ${key}`);
  
  // Pattern selection (1-4)
  if (key >= '1' && key <= '4') {
    a1c_patternType = parseInt(key) - 1;
    console.log(`A1C - Pattern set to: ${getPatternName()}`);
  }
  
  // Color mode selection (Q, W, E, T)
  switch(key.toLowerCase()) {
    case 'q':
      a1c_currentColorMode = 0;
      console.log('A1C - Color mode: Rainbow');
      break;
    case 'w':
      a1c_currentColorMode = 1;
      console.log('A1C - Color mode: Cool Blue');
      break;
    case 'e':
      a1c_currentColorMode = 2;
      console.log('A1C - Color mode: Warm');
      break;
    case 't':
      a1c_currentColorMode = 3;
      console.log('A1C - Color mode: Monochrome');
      break;
    case '+':
    case '=':
      a1c_shapeSize = window.min(a1c_shapeSize + 5, 60);
      console.log(`A1C - Size increased to: ${a1c_shapeSize}`);
      break;
    case '-':
      a1c_shapeSize = window.max(a1c_shapeSize - 5, 10);
      console.log(`A1C - Size decreased to: ${a1c_shapeSize}`);
      break;
    case ' ':
      if (a1c_animationSpeed > 0) {
        a1c_animationSpeed = 0;
        console.log('A1C - Animation paused');
      } else {
        a1c_animationSpeed = 0.02;
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
  
  // Verify functions are defined before registration
  if (typeof setupA1C !== 'function') {
    console.error('❌ setupA1C is not a function!', typeof setupA1C);
  } else if (typeof drawA1C !== 'function') {
    console.error('❌ drawA1C is not a function!', typeof drawA1C);
  } else {
    const result = projectManager.registerProject(
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
    
    if (result) {
      console.log('✅ A1C project registered successfully!');
      // Ensure UI buttons update if UI already initialized
      if (typeof uiController !== 'undefined' && uiController.initialized) {
        uiController.addProjectButton('a1c');
      }
    } else {
      console.error('❌ A1C project registration returned false! Check ProjectManager.registerProject for errors.');
    }
  }
} else {
  console.error('❌ ProjectManager not found! A1C project not registered.');
  // Retry registration after a short delay
  setTimeout(() => {
    if (typeof projectManager !== 'undefined') {
      console.log('🔄 Retrying A1C project registration...');
      if (typeof setupA1C === 'function' && typeof drawA1C === 'function') {
        const result = projectManager.registerProject(
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
        if (result) {
          console.log('✅ A1C project registered successfully on retry!');
        }
      }
    }
  }, 500);
}

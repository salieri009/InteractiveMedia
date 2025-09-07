let numShapes = 12;         
let shapeSize = 50;          
let spacing = 60;            
let shapeType = "ellipse";   
let centerSquareSize = 200;  
let waveAmplitude = 50;      
let waveSpeed = 0.03;        
let bgColors = [];           
let mixedColors = [];        

function setupA1B() {
  console.log("🎨 A1B project setup started!");
  
  // Check if p5.js functions are available
  if (typeof rectMode === 'undefined') {
    console.error('❌ p5.js not loaded! rectMode function not available.');
    return;
  }
  
  // ProjectManager already creates the canvas, so we don't need to call createCanvas
  rectMode(CENTER);
  colorMode(RGB);
  noStroke();
  initBackground();
  initMixedColors();
  
  console.log("✅ A1B project initialized successfully!");
}

function drawA1B() {
  drawQuarterBackground();
  drawCenterSquare();
  drawAnimatedShapes();
}

function initBackground() {
  bgColors = [
    color(100, 200, 200),
    color(200, 255, 200),
    color(200, 200, 255),
    color(255, 255, 200)
  ];
}

function complementaryColor(c) {
  let r = 255 - red(c);
  let g = 255 - green(c);
  let b = 255 - blue(c);
  return color(r, g, b);
}

function drawQuarterBackground() {
  let w = width / 2;
  let h = height / 2;
  for (let i = 0; i < 4; i++) {
    let r = red(bgColors[i]) + 20 * sin(frameCount * 0.005 + i);
    let g = green(bgColors[i]) + 20 * cos(frameCount * 0.006 + i);
    let b = blue(bgColors[i]) + 20 * sin(frameCount * 0.007 - i);
    fill(constrain(r, 0, 255), constrain(g, 0, 255), constrain(b, 0, 255));

    let x = (i % 2 === 0) ? w / 2 : w + w / 2;
    let y = (i < 2) ? h / 2 : h + h / 2;
    rect(x, y, w, h);
  }
}

function initMixedColors() {
  mixedColors = [
    color(255, 0, 0),
    color(0, 0, 255)
  ];
}

function getMixedColor() {
  let t1 = (sin(frameCount * 0.02) + 1) / 2;
  let t2 = (cos(frameCount * 0.015) + 1) / 2;
  return lerpColor(mixedColors[0], mixedColors[1], (t1 + t2) / 2);
}

function drawCenterSquare() {
  fill(getMixedColor());
  rect(width / 2, height / 2, centerSquareSize, centerSquareSize);
}

function drawAnimatedShapes() {
  for (let i = 0; i < numShapes; i++) {
    let x = spacing * i + shapeSize / 2;

    let factor = 1 + i * 0.1;
    let y = height / 2 + 
            abs(pow(noise(i * 0.1, frameCount * 0.01 * factor) * 2 - 1, 1.5)) * waveAmplitude * (i % 2 === 0 ? 1 : -1);

    let c = lerpColor(getMixedColor(), color(255, 255, 255), i / numShapes);
    fill(c);

    if (shapeType === "ellipse") {
      ellipse(x, y, shapeSize, shapeSize);
    } else {
      rect(x, y, shapeSize, shapeSize);
    }
  }
}

// ===============================================
// Project Registration
// ===============================================

// Register A1B project with project manager
if (typeof projectManager !== 'undefined') {
  console.log('📝 Registering A1B project...');
  projectManager.registerProject(
    'a1b',
    'A1B - Animated Shapes',
    setupA1B,
    drawA1B,
    {
      description: 'An animated project with dynamic shapes and color transitions.',
      canvasSize: { width: 800, height: 400 }
    }
  );
  console.log('✅ A1B project registered successfully!');
  // If UI controller already initialized, add the button dynamically
  if (typeof uiController !== 'undefined' && uiController.initialized) {
    uiController.addProjectButton('a1b');
  }
} else {
  console.error('❌ ProjectManager not found! A1B project not registered.');
}


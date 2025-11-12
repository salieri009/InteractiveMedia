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
  if (typeof window.rectMode === 'undefined') {
    console.error('❌ p5.js not loaded! rectMode function not available.');
    return;
  }
  
  // Additional check for other essential functions
  if (typeof window.fill === 'undefined' || typeof window.stroke === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }
  
  // ProjectManager already creates the canvas, so we don't need to call createCanvas
  window.rectMode(window.CENTER);
  window.colorMode(window.RGB);
  window.noStroke();
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
  // Store RGB values directly instead of p5.Color objects to avoid color parsing issues
  bgColors = [
    { r: 100, g: 200, b: 200 },
    { r: 200, g: 255, b: 200 },
    { r: 200, g: 200, b: 255 },
    { r: 255, g: 255, b: 200 }
  ];
}

function complementaryColor(c) {
  let r = 255 - window.red(c);
  let g = 255 - window.green(c);
  let b = 255 - window.blue(c);
  return window.color(r, g, b);
}

function drawQuarterBackground() {
  // Check if bgColors is initialized
  if (!bgColors || bgColors.length === 0) {
    initBackground();
  }
  
  let w = width / 2;
  let h = height / 2;
  for (let i = 0; i < 4; i++) {
    // Use RGB values directly from bgColors array
    let baseColor = bgColors[i];
    if (!baseColor) {
      baseColor = { r: 200, g: 200, b: 200 }; // Fallback color
    }
    
    let r = baseColor.r + 20 * window.sin(frameCount * 0.005 + i);
    let g = baseColor.g + 20 * window.cos(frameCount * 0.006 + i);
    let b = baseColor.b + 20 * window.sin(frameCount * 0.007 - i);
    window.fill(window.constrain(r, 0, 255), window.constrain(g, 0, 255), window.constrain(b, 0, 255));

    let x = (i % 2 === 0) ? w / 2 : w + w / 2;
    let y = (i < 2) ? h / 2 : h + h / 2;
    window.rect(x, y, w, h);
  }
}

function initMixedColors() {
  // Check if p5.js color function is available before creating colors
  if (typeof window.color === 'function') {
    try {
      mixedColors = [
        window.color(255, 0, 0),
        window.color(0, 0, 255)
      ];
    } catch (e) {
      console.warn('⚠️ Failed to create mixed colors, using fallback:', e);
      // Fallback: store as RGB values
      mixedColors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 0, b: 255 }
      ];
    }
  } else {
    // Fallback: store as RGB values
    mixedColors = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 0, b: 255 }
    ];
  }
}

function getMixedColor() {
  // Check if mixedColors is initialized
  if (!mixedColors || mixedColors.length < 2) {
    initMixedColors();
  }
  
  // If mixedColors contains RGB objects instead of p5.Color objects
  if (mixedColors[0] && typeof mixedColors[0] === 'object' && 'r' in mixedColors[0]) {
    let t1 = (window.sin(frameCount * 0.02) + 1) / 2;
    let t2 = (window.cos(frameCount * 0.015) + 1) / 2;
    let t = (t1 + t2) / 2;
    
    // Manual lerp for RGB values (lerp = linear interpolation)
    let r = mixedColors[0].r + (mixedColors[1].r - mixedColors[0].r) * t;
    let g = mixedColors[0].g + (mixedColors[1].g - mixedColors[0].g) * t;
    let b = mixedColors[0].b + (mixedColors[1].b - mixedColors[0].b) * t;
    return window.color(r, g, b);
  }
  
  // Use p5.js lerpColor if we have p5.Color objects
  if (typeof window.lerpColor === 'function') {
    try {
      let t1 = (window.sin(frameCount * 0.02) + 1) / 2;
      let t2 = (window.cos(frameCount * 0.015) + 1) / 2;
      return window.lerpColor(mixedColors[0], mixedColors[1], (t1 + t2) / 2);
    } catch (e) {
      console.warn('⚠️ lerpColor failed, using fallback:', e);
      return window.color(200, 200, 200);
    }
  }
  
  // Final fallback
  return window.color(200, 200, 200);
}

function drawCenterSquare() {
  window.fill(getMixedColor());
  window.rect(width / 2, height / 2, centerSquareSize, centerSquareSize);
}

function drawAnimatedShapes() {
  for (let i = 0; i < numShapes; i++) {
    let x = spacing * i + shapeSize / 2;

    let factor = 1 + i * 0.1;
    let y = height / 2 + 
            window.abs(window.pow(window.noise(i * 0.1, frameCount * 0.01 * factor) * 2 - 1, 1.5)) * waveAmplitude * (i % 2 === 0 ? 1 : -1);

    let c = window.lerpColor(getMixedColor(), window.color(255, 255, 255), i / numShapes);
    window.fill(c);

    if (shapeType === "ellipse") {
      window.ellipse(x, y, shapeSize, shapeSize);
    } else {
      window.rect(x, y, shapeSize, shapeSize);
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


// ===============================================
// A1G - Interactive Pixel Sort with Color Sampling
// Creative Project: Pixel sorting algorithm with interactive color sampling and painting
// Based on procedural image generation and real-time pixel manipulation
// ===============================================

let img;
let sortedImg;
let currentPixelColor;
let sortMode = 'brightness'; // 'brightness' or 'hue'
let sortDirection = 'horizontal'; // 'horizontal' or 'vertical'
let trailShapes = [];
let maxTrailShapes = 50;

function setupA1G() {
  console.log("🎨 A1G - Interactive Pixel Sort setup started!");
  
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
  
  // Set color mode to HSB for better hue sorting
  window.colorMode(window.HSB, 360, 100, 100, 100);
  
  // Load external image
  window.loadImage('../assets/images/GQuuuuuux.jpg', 
    function(loadedImg) {
      // Success callback
      console.log("✅ Image loaded successfully!");
      img = loadedImg;
      currentPixelColor = window.color(0);
      sortedImg = img.get();
      performPixelSort();
    },
    function(error) {
      // Error callback - fallback to procedural image
      console.log("⚠️ Failed to load image, using procedural image instead");
      createProceduralImage();
      currentPixelColor = window.color(0);
      sortedImg = img.get();
      performPixelSort();
    }
  );
  
  console.log("✅ A1G project initialized successfully!");
}

function drawA1G() {
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1G!');
    return;
  }
  
  // Additional check for drawing functions
  if (typeof window.fill === 'undefined' || typeof window.stroke === 'undefined') {
    console.error('❌ p5.js drawing functions not available in drawA1G!');
    return;
  }
  
  // Check if images are loaded
  if (!img || !sortedImg) {
    window.background(220, 20, 95);
    window.fill(0, 0, 0);
    window.textAlign(window.CENTER, window.CENTER);
    window.textSize(16);
    window.text("Loading image...", width/2, height/2);
    return;
  }

  // Background with HSB color
  window.background(220, 20, 95);
  
  // Calculate scaled positions for smaller canvas
  let scale = Math.min(width / 900, height / 600);
  let offsetX = (width - 900 * scale) / 2;
  let offsetY = (height - 600 * scale) / 2;
  
  // Draw original image (scaled)
  let imgX = 50 * scale + offsetX;
  let imgY = 50 * scale + offsetY;
  let imgW = 400 * scale;
  let imgH = 300 * scale;
  window.image(img, imgX, imgY, imgW, imgH);
  
  // Draw sorted image (scaled)
  let sortedX = 450 * scale + offsetX;
  let sortedY = 50 * scale + offsetY;
  window.image(sortedImg, sortedX, sortedY, imgW, imgH);
  
  // Sample pixel color from sorted image if mouse is over it
  let currentMouseX = typeof mouseX !== 'undefined' ? mouseX : 0;
  let currentMouseY = typeof mouseY !== 'undefined' ? mouseY : 0;
  let mouseXInImage = (currentMouseX - sortedX) / scale;
  let mouseYInImage = (currentMouseY - sortedY) / scale;
  
  if (mouseXInImage >= 0 && mouseXInImage < 400 && 
      mouseYInImage >= 0 && mouseYInImage < 300) {
    currentPixelColor = sortedImg.get(Math.floor(mouseXInImage), Math.floor(mouseYInImage));
    
    // Add trail shape with current color
    if (typeof mouseIsPressed !== 'undefined' && mouseIsPressed) {
      trailShapes.push({
        x: typeof mouseX !== 'undefined' ? mouseX : 0,
        y: typeof mouseY !== 'undefined' ? mouseY : 0,
        color: currentPixelColor,
        size: window.random(10, 30),
        shape: Math.floor(window.random(3)),
        life: 255
      });
      
      if (trailShapes.length > maxTrailShapes) {
        trailShapes.shift();
      }
    }
  }
  
  // Draw trail shapes
  for (let i = trailShapes.length - 1; i >= 0; i--) {
    let shape = trailShapes[i];
    
    // Safely extract RGB values from color
    let r, g, b;
    if (shape.color && typeof shape.color === 'object') {
      // If it's a p5.Color object, extract RGB values
      try {
        r = window.red(shape.color);
        g = window.green(shape.color);
        b = window.blue(shape.color);
      } catch (e) {
        // Fallback: if color extraction fails, use default
        console.warn('⚠️ Failed to extract color values, using fallback:', e);
        r = 200; g = 200; b = 200;
      }
    } else if (shape.color && typeof shape.color === 'number') {
      // If it's a numeric color value, convert it
      r = (shape.color >> 16) & 255;
      g = (shape.color >> 8) & 255;
      b = shape.color & 255;
    } else {
      // Fallback
      r = 200; g = 200; b = 200;
    }
    
    window.fill(r, g, b, shape.life);
    window.noStroke();
    
    if (shape.shape === 0) {
      window.ellipse(shape.x, shape.y, shape.size);
    } else if (shape.shape === 1) {
      window.rect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size);
    } else {
      window.triangle(shape.x, shape.y - shape.size/2, 
              shape.x - shape.size/2, shape.y + shape.size/2,
              shape.x + shape.size/2, shape.y + shape.size/2);
    }
    
    shape.life -= 3;
    if (shape.life <= 0) {
      trailShapes.splice(i, 1);
    }
  }
  
  // Draw UI
  drawPixelSortUI(scale, offsetX, offsetY);
}

function createProceduralImage() {
  // Create procedural image
  img = window.createGraphics(400, 300);
  img.colorMode(window.HSB, 360, 100, 100, 100);
  img.background(0, 0, 100); // White background in HSB
  
  // Create some colorful shapes for interesting pixel sorting
  for (let i = 0; i < 20; i++) {
    img.fill(window.random(0, 360), window.random(50, 100), window.random(50, 100), 60);
    img.noStroke();
    let shapeType = Math.floor(window.random(3));
    let x = window.random(img.width);
    let y = window.random(img.height);
    let size = window.random(20, 80);
    
    if (shapeType === 0) {
      img.ellipse(x, y, size, size);
    } else if (shapeType === 1) {
      img.rect(x, y, size, size);
    } else {
      img.triangle(x, y, x + size/2, y - size, x + size, y);
    }
  }
  
  // Add some gradients
  for (let i = 0; i < img.height; i++) {
    let alpha = map(i, 0, img.height, 0, 40);
    img.stroke(200, 80, 80, alpha);
    img.line(0, i, img.width, i);
  }
}

function performPixelSort() {
  sortedImg.loadPixels();
  
  if (sortDirection === 'horizontal') {
    // Sort each row
    for (let y = 0; y < sortedImg.height; y++) {
      let row = [];
      for (let x = 0; x < sortedImg.width; x++) {
        let index = (x + y * sortedImg.width) * 4;
        let r = sortedImg.pixels[index];
        let g = sortedImg.pixels[index + 1];
        let b = sortedImg.pixels[index + 2];
        let a = sortedImg.pixels[index + 3];
        row.push({r, g, b, a, x, y});
      }
      
      // Sort the row
      if (sortMode === 'brightness') {
        row.sort((a, b) => {
          let brightnessA = (a.r + a.g + a.b) / 3;
          let brightnessB = (b.r + b.g + b.b) / 3;
          return brightnessA - brightnessB;
        });
      } else { // hue
        row.sort((a, b) => {
          let hueA = hue(color(a.r, a.g, a.b));
          let hueB = hue(color(b.r, b.g, b.b));
          return hueA - hueB;
        });
      }
      
      // Put sorted pixels back
      for (let x = 0; x < sortedImg.width; x++) {
        let index = (x + y * sortedImg.width) * 4;
        sortedImg.pixels[index] = row[x].r;
        sortedImg.pixels[index + 1] = row[x].g;
        sortedImg.pixels[index + 2] = row[x].b;
        sortedImg.pixels[index + 3] = row[x].a;
      }
    }
  } else { // vertical
    // Sort each column
    for (let x = 0; x < sortedImg.width; x++) {
      let col = [];
      for (let y = 0; y < sortedImg.height; y++) {
        let index = (x + y * sortedImg.width) * 4;
        let r = sortedImg.pixels[index];
        let g = sortedImg.pixels[index + 1];
        let b = sortedImg.pixels[index + 2];
        let a = sortedImg.pixels[index + 3];
        col.push({r, g, b, a, x, y});
      }
      
      // Sort the column
      if (sortMode === 'brightness') {
        col.sort((a, b) => {
          let brightnessA = (a.r + a.g + a.b) / 3;
          let brightnessB = (b.r + b.g + b.b) / 3;
          return brightnessA - brightnessB;
        });
      } else { // hue
        col.sort((a, b) => {
          let hueA = hue(color(a.r, a.g, a.b));
          let hueB = hue(color(b.r, b.g, b.b));
          return hueA - hueB;
        });
      }
      
      // Put sorted pixels back
      for (let y = 0; y < sortedImg.height; y++) {
        let index = (x + y * sortedImg.width) * 4;
        sortedImg.pixels[index] = col[y].r;
        sortedImg.pixels[index + 1] = col[y].g;
        sortedImg.pixels[index + 2] = col[y].b;
        sortedImg.pixels[index + 3] = col[y].a;
      }
    }
  }
  
  sortedImg.updatePixels();
}

function drawPixelSortUI(scale, offsetX, offsetY) {
  // Calculate scaled UI positions
  let uiX = 50 * scale + offsetX;
  let uiY = 380 * scale + offsetY;
  
  // Draw current pixel color indicator
  if (currentPixelColor) {
    window.fill(currentPixelColor);
  } else {
    window.fill(0);
  }
  window.stroke(0, 0, 0);
  window.strokeWeight(2);
  window.rect(uiX, uiY, 60 * scale, 60 * scale);
  
  // Draw text information
  window.fill(0, 0, 0);
  window.noStroke();
  window.textSize(12 * scale);
  window.textAlign(window.LEFT);
  
  let textY = 40 * scale + offsetY;
  window.text("Original Image", uiX, textY);
  window.text("Pixel Sorted Image", 450 * scale + offsetX, textY);
  window.text("Current Pixel Color", uiX, uiY - 5 * scale);
  
  // Instructions
  let instructY = 460 * scale + offsetY;
  window.textSize(10 * scale);
  window.text("Move mouse over sorted image", uiX, instructY);
  window.text("Click and drag to paint with sampled colors", uiX, instructY + 15 * scale);
  
  // Display sort mode info
  let infoY = 500 * scale + offsetY;
  window.text("Sort Mode: " + sortMode, uiX, infoY);
  window.text("Sort Direction: " + sortDirection, uiX, infoY + 15 * scale);
  window.text("Press 'B' for brightness sort, 'H' for hue sort", uiX, infoY + 30 * scale);
  window.text("Press 'SPACE' to toggle horizontal/vertical", uiX, infoY + 45 * scale);
  
  // Display RGB values
  if (currentPixelColor) {
    let r, g, b;
    try {
      r = window.red(currentPixelColor);
      g = window.green(currentPixelColor);
      b = window.blue(currentPixelColor);
    } catch (e) {
      console.warn('⚠️ Failed to extract color values in UI:', e);
      r = 0; g = 0; b = 0;
    }
    window.text("RGB: " + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0), 
          uiX + 70 * scale, uiY + 30 * scale);
  }
  
  // Draw trail count
  window.text("Trail Shapes: " + trailShapes.length, uiX, infoY + 60 * scale);
}

// ----------------------------
// Image Loading Functions
// ----------------------------
function loadExternalImage(imagePath) {
  // Try to load external image
  try {
    loadImage(imagePath, 
      (loadedImg) => {
        console.log('🖼️ External image loaded successfully');
        // Resize to fit our canvas
        img = createGraphics(400, 300);
        img.image(loadedImg, 0, 0, 400, 300);
        sortedImg = img.get();
        performPixelSort();
      },
      (error) => {
        console.log('⚠️ Could not load external image, using procedural generation');
        createProceduralImage();
      }
    );
  } catch (error) {
    console.log('⚠️ Error loading image, using procedural generation');
    createProceduralImage();
  }
}

// ----------------------------
// Interaction Functions
// ----------------------------
function mousePressedA1G() {
  // Mouse interaction is handled in draw loop
  console.log("🎨 Mouse pressed in A1G - painting with sampled colors");
}

function keyPressedA1G() {
  if (key === 'b' || key === 'B') {
    sortMode = 'brightness';
    performPixelSort();
    console.log("🔢 Sort mode changed to brightness");
  } else if (key === 'h' || key === 'H') {
    sortMode = 'hue';
    performPixelSort();
    console.log("🌈 Sort mode changed to hue");
  } else if (key === ' ') {
    sortDirection = sortDirection === 'horizontal' ? 'vertical' : 'horizontal';
    performPixelSort();
    console.log("🔄 Sort direction changed to " + sortDirection);
  } else if (key === 'r' || key === 'R') {
    // Regenerate image
    createProceduralImage();
    sortedImg = img.get();
    performPixelSort();
    trailShapes = [];
    console.log("🔄 Image regenerated");
  } else if (key === 'c' || key === 'C') {
    // Clear trail shapes
    trailShapes = [];
    console.log("🧹 Trail shapes cleared");
  } else if (key === 'l' || key === 'L') {
    // Load external image (이미지를 넣었을 때 사용)
    loadExternalImage('./assets/images/sample-image.jpg');
    console.log("📷 Attempting to load external image");
  }
}

// Register A1G project with ProjectManager
if (typeof projectManager !== 'undefined') {
  projectManager.registerProject(
    'a1g',
    'A1G - Interactive Pixel Sort',
    setupA1G,
    drawA1G,
    {
      mousePressed: mousePressedA1G,
      keyPressed: keyPressedA1G,
      description: 'Interactive pixel sorting with color sampling. Move mouse over sorted image to sample colors, click and drag to paint. Use B/H to change sort mode, SPACE to toggle direction, L to load external image.',
      canvasSize: { width: 800, height: 600 }
    }
  );
  console.log('✅ A1G project registered successfully!');
  
  // Add button to UI
  if (typeof uiController !== 'undefined' && uiController.initialized) {
    uiController.addProjectButton('a1g');
  }
} else {
  console.error('❌ ProjectManager not found! A1G project not registered.');
}
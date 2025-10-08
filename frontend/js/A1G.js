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
  if (typeof background === 'undefined') {
    console.error('❌ p5.js not loaded! background function not available.');
    return;
  }
  
  // Set color mode to HSB for better hue sorting
  colorMode(HSB, 360, 100, 100, 100);
  
  // Load external image
  loadImage('../assets/images/GQuuuuuux.jpg', 
    function(loadedImg) {
      // Success callback
      console.log("✅ Image loaded successfully!");
      img = loadedImg;
      currentPixelColor = color(0);
      sortedImg = img.get();
      performPixelSort();
    },
    function(error) {
      // Error callback - fallback to procedural image
      console.log("⚠️ Failed to load image, using procedural image instead");
      createProceduralImage();
      currentPixelColor = color(0);
      sortedImg = img.get();
      performPixelSort();
    }
  );
  
  console.log("✅ A1G project initialized successfully!");
}

function drawA1G() {
  // Check if p5.js functions are available
  if (typeof background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1G!');
    return;
  }
  
  // Check if images are loaded
  if (!img || !sortedImg) {
    background(220, 20, 95);
    fill(0, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Loading image...", width/2, height/2);
    return;
  }

  // Background with HSB color
  background(220, 20, 95);
  
  // Calculate scaled positions for smaller canvas
  let scale = Math.min(width / 900, height / 600);
  let offsetX = (width - 900 * scale) / 2;
  let offsetY = (height - 600 * scale) / 2;
  
  // Draw original image (scaled)
  let imgX = 50 * scale + offsetX;
  let imgY = 50 * scale + offsetY;
  let imgW = 400 * scale;
  let imgH = 300 * scale;
  image(img, imgX, imgY, imgW, imgH);
  
  // Draw sorted image (scaled)
  let sortedX = 450 * scale + offsetX;
  let sortedY = 50 * scale + offsetY;
  image(sortedImg, sortedX, sortedY, imgW, imgH);
  
  // Sample pixel color from sorted image if mouse is over it
  let mouseXInImage = (mouseX - sortedX) / scale;
  let mouseYInImage = (mouseY - sortedY) / scale;
  
  if (mouseXInImage >= 0 && mouseXInImage < 400 && 
      mouseYInImage >= 0 && mouseYInImage < 300) {
    currentPixelColor = sortedImg.get(Math.floor(mouseXInImage), Math.floor(mouseYInImage));
    
    // Add trail shape with current color
    if (mouseIsPressed) {
      trailShapes.push({
        x: mouseX,
        y: mouseY,
        color: currentPixelColor,
        size: random(10, 30),
        shape: Math.floor(random(3)),
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
    fill(red(shape.color), green(shape.color), blue(shape.color), shape.life);
    noStroke();
    
    if (shape.shape === 0) {
      ellipse(shape.x, shape.y, shape.size);
    } else if (shape.shape === 1) {
      rect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size);
    } else {
      triangle(shape.x, shape.y - shape.size/2, 
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
  img = createGraphics(400, 300);
  img.colorMode(HSB, 360, 100, 100, 100);
  img.background(0, 0, 100); // White background in HSB
  
  // Create some colorful shapes for interesting pixel sorting
  for (let i = 0; i < 20; i++) {
    img.fill(random(0, 360), random(50, 100), random(50, 100), 60);
    img.noStroke();
    let shapeType = Math.floor(random(3));
    let x = random(img.width);
    let y = random(img.height);
    let size = random(20, 80);
    
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
  fill(currentPixelColor);
  stroke(0, 0, 0);
  strokeWeight(2);
  rect(uiX, uiY, 60 * scale, 60 * scale);
  
  // Draw text information
  fill(0, 0, 0);
  noStroke();
  textSize(12 * scale);
  textAlign(LEFT);
  
  let textY = 40 * scale + offsetY;
  text("Original Image", uiX, textY);
  text("Pixel Sorted Image", 450 * scale + offsetX, textY);
  text("Current Pixel Color", uiX, uiY - 5 * scale);
  
  // Instructions
  let instructY = 460 * scale + offsetY;
  textSize(10 * scale);
  text("Move mouse over sorted image", uiX, instructY);
  text("Click and drag to paint with sampled colors", uiX, instructY + 15 * scale);
  
  // Display sort mode info
  let infoY = 500 * scale + offsetY;
  text("Sort Mode: " + sortMode, uiX, infoY);
  text("Sort Direction: " + sortDirection, uiX, infoY + 15 * scale);
  text("Press 'B' for brightness sort, 'H' for hue sort", uiX, infoY + 30 * scale);
  text("Press 'SPACE' to toggle horizontal/vertical", uiX, infoY + 45 * scale);
  
  // Display RGB values
  if (currentPixelColor) {
    let r = red(currentPixelColor);
    let g = green(currentPixelColor);
    let b = blue(currentPixelColor);
    text("RGB: " + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0), 
          uiX + 70 * scale, uiY + 30 * scale);
  }
  
  // Draw trail count
  text("Trail Shapes: " + trailShapes.length, uiX, infoY + 60 * scale);
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
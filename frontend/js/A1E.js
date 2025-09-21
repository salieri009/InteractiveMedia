// ===============================================
// A1E - Sound-Painted Night Sky
// Creative Project: Create beautiful night sky with voice and interactions
// ===============================================

let stars = [];
let meteors = [];
let constellations = [];
let ripples = [];

let mic;
let audioLevel = 0;
let isAudioEnabled = false;
let audioThreshold = 0.005; // More sensitive threshold

function setupA1E() {
  console.log("🎨 A1E - Sound-Painted Night Sky setup started!");
  
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js not loaded! background function not available.');
    return;
  }
  
  // ProjectManager already creates the canvas, so we don't need to call createCanvas
  window.textAlign(CENTER, CENTER);

  // Initialize some default stars
  for (let i = 0; i < 20; i++) {
    stars.push({
      x: window.random(window.width),
      y: window.random(window.height),
      size: window.random(2, 4),
      brightness: 255,
      lifespan: window.random(200, 500)
    });
  }
  
  // Try to initialize microphone
  try {
    mic = new p5.AudioIn();
    mic.start();
    isAudioEnabled = true;
    console.log("🎤 Microphone initialized successfully!");
    console.log("🎤 Audio level threshold:", audioThreshold);
    console.log("🎤 Speak to create stars!");
  } catch (error) {
    console.log("⚠️ Microphone not available, audio features disabled");
    console.log("⚠️ Error:", error);
    console.log("⚠️ Please allow microphone access and refresh the page");
    isAudioEnabled = false;
  }
  
  console.log("✅ A1E project initialized successfully!");
}

function drawA1E() {
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1E!');
    return;
  }

  // Update audio level if microphone is available
  if (isAudioEnabled && mic) {
    audioLevel = mic.getLevel();
    
    // Create stars based on audio input
    if (audioLevel > audioThreshold) {
      let starSize = window.map(audioLevel, 0, 1, 1, 8);
      let starBrightness = window.map(audioLevel, 0, 1, 100, 255);
      let starLifespan = window.map(audioLevel, 0, 1, 200, 600);
      
      stars.push({
        x: window.random(0, window.width),
        y: window.random(0, window.height),
        size: starSize,
        brightness: starBrightness,
        lifespan: starLifespan
      });
      
      // Debug: Log when stars are created from audio
      if (frameCount % 60 === 0) { // Log every second
        console.log(`🎤 Audio level: ${(audioLevel * 100).toFixed(1)}% - Star created!`);
      }
    }
  } else if (!isAudioEnabled) {
    // Show message if microphone is not available
    if (frameCount % 120 === 0) { // Log every 2 seconds
      console.log("⚠️ Microphone not enabled - speak to create stars!");
    }
  }

  window.background(0, 0, 0); // Black sky

  // 오브젝트 업데이트 및 그리기
  updateAndDrawStars();
  updateAndDrawMeteors();
  updateAndDrawConstellations();
  updateAndDrawRipples();
  
  // Draw UI
  drawUI();
}

function updateAndDrawStars() {
  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    s.lifespan--;
    
    window.fill(255);
    window.noStroke();
    window.ellipse(s.x, s.y, s.size);

    if (s.lifespan <= 0) stars.splice(i, 1);
  }
}

function updateAndDrawMeteors() {
  for (let i = meteors.length - 1; i >= 0; i--) {
    let m = meteors[i];
    m.x += window.cos(m.angle) * m.speed;
    m.y += window.sin(m.angle) * m.speed;
    m.lifespan--;
    m.trail.push({ x: m.x, y: m.y });
    if (m.trail.length > 10) m.trail.shift();

    window.stroke(255, 255, 255);
    for (let j = 0; j < m.trail.length - 1; j++) {
      window.line(m.trail[j].x, m.trail[j].y, m.trail[j + 1].x, m.trail[j + 1].y);
    }

    window.noStroke();
    window.fill(255);
    window.ellipse(m.x, m.y, 4);

    if (m.lifespan <= 0 || m.x < 0 || m.x > window.width || m.y < 0 || m.y > window.height)
      meteors.splice(i, 1);
  }
}

// ----------------------------
// Constellation functions
// ----------------------------
function updateAndDrawConstellations() {
  for (let i = constellations.length - 1; i >= 0; i--) {
    let c = constellations[i];
    c.lifespan--;

    for (let j = 0; j < c.stars.length; j++) {
      let s = c.stars[j];
      window.fill(255);
      window.noStroke();
      window.ellipse(s.x, s.y, s.size);
    }

    if (c.lifespan <= 0) constellations.splice(i, 1);
  }
}

function createConstellation(letter, x, y) {
  let pattern = [];
  let size = 20;
  switch (letter.toUpperCase()) {
    case 'A':
      pattern = [{x:0,y:10},{x:-5,y:-5},{x:5,y:-5},{x:-3,y:0},{x:3,y:0}]; break;
    case 'B':
      pattern = [{x:-8,y:-8},{x:-8,y:8},{x:-5,y:-8},{x:-5,y:0},{x:-5,y:8},{x:2,y:-8},{x:2,y:0},{x:2,y:8}]; break;
    case 'C':
      pattern = [{x:5,y:-8},{x:0,y:-8},{x:-5,y:-5},{x:-8,y:0},{x:-5,y:5},{x:0,y:8},{x:5,y:8}]; break;
    default:
      pattern = [{x:0,y:0},{x:5,y:5},{x:-5,y:-5},{x:5,y:-5},{x:-5,y:5}];
  }

  constellations.push({
    letter: letter,
    x: x,
    y: y,
    stars: pattern.map(p => ({
      x: x + p.x*size/10,
      y: y + p.y*size/10,
      size: 3
    })),
    lifespan: 600
  });
}

// ----------------------------
// Ripple functions
// ----------------------------
function updateAndDrawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    r.radius += r.speed;
    r.alpha -= 2;

    if (r.alpha <= 0) ripples.splice(i, 1);
    else {
      window.stroke(255, 255, 255, r.alpha);
      window.strokeWeight(2);
      window.noFill();
      window.ellipse(r.x, r.y, r.radius*2);
    }
  }
}

// ----------------------------
// UI Functions
// ----------------------------
function drawUI() {
  // UI panel background
  window.fill(0, 0, 0, 150);
  window.rect(10, 10, 250, 140);
  
  // Text
  window.fill(255, 255, 255);
  window.textSize(12);
  window.textAlign(window.LEFT);
  window.text("Sound-Painted Night Sky", 20, 30);
  
  // Microphone status
  if (isAudioEnabled) {
    window.fill(0, 255, 0);
    window.text("🎤 Microphone: ON", 20, 50);
    window.fill(255, 255, 255);
    window.text(`Audio Level: ${(audioLevel * 100).toFixed(1)}%`, 20, 70);
  } else {
    window.fill(255, 0, 0);
    window.text("🎤 Microphone: OFF", 20, 50);
    window.fill(255, 255, 255);
    window.text("Click to enable microphone", 20, 70);
  }
  
  // Object counts
  window.fill(255, 255, 255);
  window.text(`Stars: ${stars.length}`, 20, 90);
  window.text(`Meteors: ${meteors.length}`, 20, 110);
  window.text(`Constellations: ${constellations.length}`, 20, 130);
  
  // Instructions
  window.textSize(10);
  window.text("Click: Meteor | A-Z: Constellation | Space: Star | R: Reset", 20, 150);
  window.textAlign(window.CENTER);
  
  // Audio level indicator
  if (isAudioEnabled) {
    window.fill(255, 255, 255, 100);
    window.rect(10, 160, audioLevel * 250, 8);
  }
}

// ----------------------------
// Interaction
// ----------------------------
function mousePressedA1E() {
  meteors.push({ x: window.mouseX, y: window.mouseY, angle: window.random(-window.PI/4, window.PI/4), speed: 4, lifespan: 60, trail: [] });
  ripples.push({ x: window.mouseX, y: window.mouseY, radius: 0, speed: 2, alpha: 255 });
}

function keyPressedA1E() {
  if ((window.key >= 'A' && window.key <= 'Z') || (window.key >= 'a' && window.key <= 'z')) {
    createConstellation(window.key, window.mouseX, window.mouseY);
  }

  if (window.key === ' ') {
    stars.push({ x: window.random(window.width), y: window.random(window.height), size: window.random(2,6), brightness: 255, lifespan: window.random(300,600) });
  }

  if (window.key === 'r' || window.key === 'R') {
    stars=[]; meteors=[]; constellations=[]; ripples=[];
    for (let i = 0; i < 20; i++) {
      stars.push({x:window.random(window.width),y:window.random(window.height),size:window.random(2,4),brightness:255,lifespan:window.random(200,500)});
    }
  }
}

// Register A1E project with ProjectManager (if available)
if (typeof projectManager !== 'undefined') {
  projectManager.registerProject(
    'a1e',
    'A1E - Sound-Painted Night Sky',
    setupA1E,
    drawA1E,
    {
      mousePressed: mousePressedA1E,
      keyPressed: keyPressedA1E,
      description: 'Create beautiful night sky with voice and interactions. Speak to create stars, click for meteors, type letters for constellations.',
      canvasSize: { width: 600, height: 400 }
    }
  );
  if (typeof uiController !== 'undefined' && uiController.initialized) {
    uiController.addProjectButton('a1e');
  }
}
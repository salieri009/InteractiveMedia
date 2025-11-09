// A1I - The Observant Shopper (Compact Version)
let a1i_video, a1i_detector, a1i_speech;
let a1i_detections = [], a1i_shoppingListSet = new Set(), a1i_shoppingListDisplay = [];
let a1i_modelLoaded = false, a1i_videoReady = false, a1i_isDetecting = false;
let a1i_bgColor, a1i_listBgColor, a1i_accentColor;

const a1i_presets = {
  default: { name: "Default", confidence: 0.5, rate: 0.9, pitch: 1.0 },
  sensitive: { name: "Sensitive", confidence: 0.35, rate: 1.3, pitch: 1.2 },
  cautious: { name: "Cautious", confidence: 0.8, rate: 0.7, pitch: 0.8 },
};
let a1i_presetKeys = Object.keys(a1i_presets);
let a1i_currentPresetIndex = 0;
let a1i_currentPreset = a1i_presets[a1i_presetKeys[a1i_currentPresetIndex]];

function applyPreset() {
  a1i_currentPreset = a1i_presets[a1i_presetKeys[a1i_currentPresetIndex]];
  if (a1i_speech) {
    a1i_speech.setRate(a1i_currentPreset.rate);
    a1i_speech.setPitch(a1i_currentPreset.pitch);
  }
  a1i_shoppingListSet.clear();
  a1i_shoppingListDisplay = [];
  console.log(`Preset changed to: ${a1i_currentPreset.name}`);
}

function setupA1I() {
  console.log("🛒 Setting up A1I - The Observant Shopper");
  
  try {
    resizeCanvas(800, 500);
    console.log("✅ Canvas resized");
  } catch (e) {
    console.error("❌ Error resizing canvas:", e);
  }
  
  a1i_bgColor = color(20, 20, 40);
  a1i_listBgColor = color(30, 30, 50);
  a1i_accentColor = color(0, 255, 100);

  a1i_detections = [];
  a1i_shoppingListSet.clear();
  a1i_shoppingListDisplay = [];
  a1i_modelLoaded = false;
  a1i_videoReady = false;
  a1i_isDetecting = false;

  console.log("📹 Attempting to create video capture...");
  try {
    if (typeof createCapture === 'undefined') {
      throw new Error("createCapture is not defined! Check if p5.js functions are exposed.");
    }
    video = createCapture(VIDEO, () => { 
      videoReady = true; 
      console.log("✅ Video ready");
    });
    video.size(640, 500);
    video.hide();
    console.log("✅ Video capture created");
  } catch (e) { 
    console.error("❌ Error creating video capture:", e); 
  }

  console.log("🔊 Attempting to initialize speech...");
  try {
    if (typeof p5.Speech !== 'undefined') {
      speech = new p5.Speech();
      speech.setLang('en-US');
      applyPreset();
      console.log("✅ Speech initialized");
    } else {
      console.warn("⚠️ p5.Speech not available");
    }
  } catch (e) { 
    console.error("❌ Error initializing speech:", e); 
  }

  console.log("🤖 Attempting to load ml5 model...");
  try {
    if (typeof ml5 !== 'undefined') {
      detector = ml5.objectDetector('cocossd', () => {
        modelLoaded = true;
        console.log("✅ ml5 model loaded");
        if (videoReady) startDetection();
      });
      console.log("✅ ml5 objectDetector called");
    } else {
      console.error("❌ ml5 is not defined!");
    }
  } catch (e) { 
    console.error("❌ Error loading ml5 model:", e); 
  }
  
  console.log("✅ setupA1I completed");
}

function startDetection() {
  if (!isDetecting && modelLoaded && videoReady && detector) {
    isDetecting = true;
    detector.detect(video, gotResults);
  }
}

function gotResults(error, results) {
  if (error) return console.error("Detection error:", error);
  detections = results || [];
  for (let obj of detections) {
    if (obj.confidence > currentPreset.confidence && !shoppingListSet.has(obj.label)) {
      shoppingListSet.add(obj.label);
      shoppingListDisplay.push(obj.label);
      if (speech && !speech.speaking) {
        try { speech.speak(obj.label); } catch (e) { console.error("Speech error:", e); }
      }
    }
  }
  if (isDetecting) detector.detect(video, gotResults);
}

function drawA1I() {
  background(bgColor);
  if (videoReady) image(video, 0, 0, 640, 500);
  else {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("📹 Initializing webcam...", 320, 250);
  }

  for (let obj of detections) drawBox(obj);
  drawList();
  drawStatus();
  if (!isDetecting && modelLoaded && videoReady) startDetection();
}

function drawBox(obj) {
  push();
  noFill();
  strokeWeight(3);
  stroke(accentColor);
  rect(obj.x, obj.y, obj.width, obj.height);
  noStroke();
  fill(accentColor);
  textSize(16);
  textAlign(LEFT, BOTTOM);
  text(`${obj.label} (${nfc(obj.confidence * 100, 0)}%)`, obj.x + 5, obj.y - 5);
  pop();
}

function drawList() {
  push();
  noStroke();
  fill(listBgColor);
  rect(640, 0, 160, 500);
  fill(240);
  textSize(20);
  textAlign(LEFT, TOP);
  text("🛒 Shopping List", 660, 20);
  stroke(accentColor);
  strokeWeight(2);
  line(660, 45, 790, 45);
  noStroke();
  textSize(18);
  let y = 60;
  for (let i = 0; i < shoppingListDisplay.length; i++) {
    if (y > 480) {
      fill(150);
      text("...and more", 660, y);
      break;
    }
    fill(255);
    text(`${i + 1}. ${shoppingListDisplay[i]}`, 660, y);
    y += 22;
  }
  if (shoppingListDisplay.length > 0) {
    fill(150);
    textSize(14);
    textAlign(RIGHT, BOTTOM);
    text(`Total: ${shoppingListDisplay.length}`, 790, 490);
  }
  pop();
}

function drawStatus() {
  push();
  let statusText = modelLoaded && videoReady ? "● DETECTING" : "● LOADING...";
  fill(modelLoaded && videoReady ? color(0, 255, 100) : color(255, 200, 0));
  noStroke();
  circle(10, 10, 12);
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text(statusText, 25, 4);
  fill(255, 200);
  textSize(14);
  textAlign(RIGHT, TOP);
  text(`Preset: ${currentPreset.name} (P)`, 790, 10);
  pop();
}

function keyPressedA1I() {
  if (key === 's' || key === 'S') saveCanvas(`observant-shopper-${currentPreset.name}`, 'png');
  if (key === 'c' || key === 'C') {
    shoppingListSet.clear();
    shoppingListDisplay = [];
  }
  if (key === 'r' || key === 'R') {
    isDetecting = false;
    setTimeout(() => startDetection(), 100);
  }
  if (key === 'p' || key === 'P') {
    currentPresetIndex = (currentPresetIndex + 1) % presetKeys.length;
    applyPreset();
  }
}

function cleanupA1I() {
  isDetecting = false;
  if (video) {
    video.remove();
    video = null;
  }
  detections = [];
  shoppingListSet.clear();
  shoppingListDisplay = [];
  detector = null;
  speech = null;
}

if (typeof projectManager !== 'undefined') {
  console.log('📝 Registering A1I project...');
  projectManager.registerProject(
    'a1i',
    'A1I - The Observant Shopper',
    setupA1I,
    drawA1I,
    {
      keyPressed: keyPressedA1I,
      cleanup: cleanupA1I,
      description: 'ML-powered object detection with voice narration and shopping list. Uses webcam, ml5.js COCO-SSD, and text-to-speech to identify and catalog objects in real-time.',
      canvasSize: { width: 800, height: 500 }
    }
  );
  console.log('✅ A1I project registered successfully!');
} else {
  console.error('❌ ProjectManager not found! A1I project not registered.');
}

console.log("✅ A1I.js loaded successfully");


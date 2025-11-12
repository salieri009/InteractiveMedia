// A1I - The Observant Shopper
let a1i_video, a1i_detector, a1i_speech;
let a1i_detections = [], a1i_list = new Set(), a1i_listArr = [];
let a1i_ready = { model: false, video: false, detecting: false };
let a1i_colors = {};

const a1i_presets = {
  default: { name: "Default", conf: 0.5, rate: 0.9, pitch: 1.0 },
  sensitive: { name: "Sensitive", conf: 0.35, rate: 1.3, pitch: 1.2 },
  cautious: { name: "Cautious", conf: 0.8, rate: 0.7, pitch: 0.8 },
};
let a1i_presetIdx = 0;
let a1i_preset = a1i_presets.default;

// 시간의 잔상 (Time Echoes)
let a1i_echoes = [];
const a1i_maxEchoes = 5;

// 픽셀 폭발 (Pixel Explosion)
let a1i_explosions = [];
let a1i_lastLabels = new Set();

function setupA1I() {
  console.log("🛒 Setting up A1I");
  
  // Check if p5.js functions are available
  if (typeof window.resizeCanvas === 'undefined') {
    console.error('❌ p5.js not loaded! resizeCanvas function not available.');
    return;
  }
  
  // Additional check for other essential functions
  if (typeof window.fill === 'undefined' || typeof window.stroke === 'undefined') {
    console.error('❌ p5.js drawing functions not available!');
    return;
  }
  
  window.resizeCanvas(800, 500);
  window.colorMode(window.RGB, 255);
  
  a1i_colors = { bg: window.color(20, 20, 40), list: window.color(30, 30, 50), accent: window.color(0, 255, 100) };
  a1i_detections = [];
  a1i_list.clear();
  a1i_listArr = [];
  a1i_ready = { model: false, video: false, detecting: false };
  a1i_echoes = [];
  a1i_explosions = [];
  a1i_lastLabels.clear();

  try {
    a1i_video = window.createCapture(window.VIDEO, () => { a1i_ready.video = true; console.log("✅ Video ready"); });
    a1i_video.size(640, 500);
    a1i_video.hide();
  } catch (e) { console.error("❌ Video error:", e); }

  try {
    if (typeof p5.Speech !== 'undefined') {
      a1i_speech = new p5.Speech();
      a1i_speech.setLang('en-US');
      a1i_applyPreset();
    }
  } catch (e) { console.error("❌ Speech error:", e); }

  try {
    if (typeof ml5 !== 'undefined') {
      a1i_detector = ml5.objectDetector('cocossd', () => {
        a1i_ready.model = true;
        console.log("✅ Model loaded");
        if (a1i_ready.video) a1i_startDetection();
      });
    }
  } catch (e) { console.error("❌ ml5 error:", e); }
}

function a1i_startDetection() {
  if (!a1i_ready.detecting && a1i_ready.model && a1i_ready.video && a1i_detector) {
    a1i_ready.detecting = true;
    a1i_detector.detect(a1i_video, a1i_gotResults);
  }
}

function a1i_gotResults(error, results) {
  if (error) return console.error("❌ Detection error:", error);
  a1i_detections = results || [];
  
  // 시간의 잔상 저장
  if (a1i_detections.length > 0) {
    a1i_echoes.push([...a1i_detections]);
    if (a1i_echoes.length > a1i_maxEchoes) a1i_echoes.shift();
  }
  
  for (let obj of a1i_detections) {
    if (obj.confidence > a1i_preset.conf && !a1i_list.has(obj.label)) {
      a1i_list.add(obj.label);
      a1i_listArr.push(obj.label);
      
      // 픽셀 폭발 생성 (새 물체 감지 시)
      if (!a1i_lastLabels.has(obj.label)) {
        a1i_createExplosion(obj);
        a1i_lastLabels.add(obj.label);
      }
      
      if (a1i_speech && !a1i_speech.speaking) {
        try { a1i_speech.speak(obj.label); } catch (e) {}
      }
    }
  }
  if (a1i_ready.detecting) a1i_detector.detect(a1i_video, a1i_gotResults);
}

function drawA1I() {
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1I!');
    return;
  }

  window.background(20, 20, 40);
  if (a1i_ready.video) window.image(a1i_video, 0, 0, 640, 500);
  else {
    window.fill(255);
    window.textAlign(window.CENTER, window.CENTER);
    window.textSize(24);
    window.text("📹 Initializing...", 320, 250);
  }

  // 시간의 잔상 그리기
  a1i_drawEchoes();
  
  // 픽셀 폭발 업데이트 & 그리기
  a1i_updateExplosions();
  
  for (let obj of a1i_detections) a1i_drawBox(obj);
  a1i_drawList();
  a1i_drawStatus();
  if (!a1i_ready.detecting && a1i_ready.model && a1i_ready.video) a1i_startDetection();
}

function a1i_drawBox(obj) {
  window.push();
  window.noFill();
  window.strokeWeight(3);
  window.stroke(0, 255, 100);
  window.rect(obj.x, obj.y, obj.width, obj.height);
  window.noStroke();
  window.fill(0, 255, 100);
  window.textSize(16);
  window.textAlign(window.LEFT, window.BOTTOM);
  window.text(`${obj.label} (${Math.round(obj.confidence * 100)}%)`, obj.x + 5, obj.y - 5);
  window.pop();
}

function a1i_drawList() {
  window.push();
  window.noStroke();
  window.fill(30, 30, 50);
  window.rect(640, 0, 160, 500);
  window.fill(240);
  window.textSize(20);
  window.textAlign(window.LEFT, window.TOP);
  window.text("🛒 List", 660, 20);
  window.stroke(0, 255, 100);
  window.strokeWeight(2);
  window.line(660, 45, 790, 45);
  window.noStroke();
  window.textSize(18);
  let y = 60;
  for (let i = 0; i < a1i_listArr.length; i++) {
    if (y > 480) { window.fill(150); window.text("...", 660, y); break; }
    window.fill(255);
    window.text(`${i + 1}. ${a1i_listArr[i]}`, 660, y);
    y += 22;
  }
  if (a1i_listArr.length > 0) {
    window.fill(150);
    window.textSize(14);
    window.textAlign(window.RIGHT, window.BOTTOM);
    window.text(`Total: ${a1i_listArr.length}`, 790, 490);
  }
  window.pop();
}

function a1i_drawStatus() {
  window.push();
  let ok = a1i_ready.model && a1i_ready.video;
  if (ok) window.fill(0, 255, 100);
  else window.fill(255, 200, 0);
  window.noStroke();
  window.circle(10, 10, 12);
  window.fill(255);
  window.textSize(12);
  window.textAlign(window.LEFT, window.TOP);
  window.text(ok ? "● DETECTING" : "● LOADING...", 25, 4);
  window.fill(255, 200);
  window.textSize(14);
  window.textAlign(window.RIGHT, window.TOP);
  window.text(`Preset: ${a1i_preset.name} (P)`, 790, 10);
  window.pop();
}

function a1i_applyPreset() {
  let keys = Object.keys(a1i_presets);
  a1i_preset = a1i_presets[keys[a1i_presetIdx]];
  if (a1i_speech) {
    a1i_speech.setRate(a1i_preset.rate);
    a1i_speech.setPitch(a1i_preset.pitch);
  }
  a1i_list.clear();
  a1i_listArr = [];
}

function keyPressedA1I() {
  if (typeof key !== 'undefined' && (key === 's' || key === 'S')) {
    if (typeof window.saveCanvas === 'function') {
      window.saveCanvas(`observant-shopper-${a1i_preset.name}`, 'png');
    }
  }
  if (typeof key !== 'undefined') {
    if (key === 'c' || key === 'C') { 
      a1i_list.clear(); 
      a1i_listArr = []; 
      a1i_lastLabels.clear();
      a1i_echoes = [];
      a1i_explosions = [];
    }
    if (key === 'r' || key === 'R') { a1i_ready.detecting = false; setTimeout(() => a1i_startDetection(), 100); }
    if (key === 'e' || key === 'E') {
      // E키: 현재 감지된 모든 물체에서 폭발 효과
      for (let obj of a1i_detections) a1i_createExplosion(obj);
    }
    if (key === 'p' || key === 'P') {
      a1i_presetIdx = (a1i_presetIdx + 1) % 3;
      a1i_applyPreset();
      console.log(`Preset: ${a1i_preset.name}`);
    }
  }
}

function cleanupA1I() {
  a1i_ready.detecting = false;
  if (a1i_video) { a1i_video.remove(); a1i_video = null; }
  a1i_detections = [];
  a1i_list.clear();
  a1i_listArr = [];
  a1i_detector = null;
  a1i_speech = null;
  a1i_echoes = [];
  a1i_explosions = [];
  a1i_lastLabels.clear();
}

// === 시간의 잔상 (Time Echoes) ===
function a1i_drawEchoes() {
  window.push();
  for (let i = 0; i < a1i_echoes.length; i++) {
    let alpha = window.map(i, 0, a1i_echoes.length - 1, 30, 150);
    let thickness = window.map(i, 0, a1i_echoes.length - 1, 1, 3);
    for (let obj of a1i_echoes[i]) {
      window.noFill();
      window.stroke(0, 255, 100, alpha);
      window.strokeWeight(thickness);
      window.rect(obj.x, obj.y, obj.width, obj.height);
    }
  }
  window.pop();
}

// === 픽셀 폭발 (Pixel Explosion) ===
function a1i_createExplosion(obj) {
  let centerX = obj.x + obj.width / 2;
  let centerY = obj.y + obj.height / 2;
  let numPixels = 20;
  
  for (let i = 0; i < numPixels; i++) {
    let angle = window.random(window.TWO_PI);
    let speed = window.random(2, 6);
    let size = window.random(5, 15);
    let hue = window.random(100, 255);
    
    a1i_explosions.push({
      x: centerX,
      y: centerY,
      vx: window.cos(angle) * speed,
      vy: window.sin(angle) * speed,
      size: size,
      life: 60,
      maxLife: 60,
      rotation: window.random(window.TWO_PI),
      rotSpeed: window.random(-0.2, 0.2),
      color: [hue, 255, 100]
    });
  }
}

function a1i_updateExplosions() {
  window.push();
  for (let i = a1i_explosions.length - 1; i >= 0; i--) {
    let p = a1i_explosions[i];
    
    // 업데이트
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.rotation += p.rotSpeed;
    p.life--;
    
    // 그리기
    let alpha = window.map(p.life, 0, p.maxLife, 0, 255);
    window.push();
    window.translate(p.x, p.y);
    window.rotate(p.rotation);
    window.noStroke();
    window.fill(p.color[0], p.color[1], p.color[2], alpha);
    window.rect(-p.size/2, -p.size/2, p.size, p.size);
    window.pop();
    
    // 제거
    if (p.life <= 0) a1i_explosions.splice(i, 1);
  }
  window.pop();
}

if (typeof projectManager !== 'undefined') {
  console.log('📝 Registering A1I project...');
  projectManager.registerProject('a1i', 'A1I - The Observant Shopper', setupA1I, drawA1I, {
    keyPressed: keyPressedA1I,
    cleanup: cleanupA1I,
    description: 'ML-powered object detection with voice narration and shopping list.',
    canvasSize: { width: 800, height: 500 }
  });
  console.log('✅ A1I registered');
} else {
  console.error('❌ ProjectManager not found');
}

console.log("✅ A1I.js loaded");

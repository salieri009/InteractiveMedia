/**
 * A1I ??The Observant Shopper
 *
 * Uses ml5.js COCO-SSD object detection on live webcam video to build
 * a shopping list in real time. New detections trigger pixel-explosion
 * particle effects and optional speech synthesis via p5.Speech.
 *
 * Controls:
 *  C ??clear detection list and visual effects
 *  R ??restart detection loop
 *  E ??trigger explosion on all current detections
 *  P ??cycle detection confidence preset
 *  S ??save canvas as PNG
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Interfaces
   ================================================================ */

interface IA1IPreset {
  name:  string;
  conf:  number;
  rate:  number;
  pitch: number;
}

interface IDetection {
  label:      string;
  confidence: number;
  x:          number;
  y:          number;
  width:      number;
  height:     number;
}

interface IExplosionParticle {
  x:        number;
  y:        number;
  vx:       number;
  vy:       number;
  size:     number;
  life:     number;
  maxLife:  number;
  rotation: number;
  rotSpeed: number;
  color:    [number, number, number];
}

interface ISpeechWrapper {
  setLang:  (lang: string) => void;
  setRate:  (rate: number) => void;
  setPitch: (pitch: number) => void;
  speak:    (text: string) => void;
  speaking: boolean;
}

/* ================================================================
   Module state
   ================================================================ */

let a1i_video:      p5.Element | null              = null;
let a1i_detector:   ReturnType<typeof ml5.objectDetector> | null = null;
let a1i_speech:     ISpeechWrapper | null          = null;

let a1i_detections: IDetection[]  = [];
let a1i_list:       Set<string>   = new Set();
let a1i_listArr:    string[]      = [];

const a1i_ready = { model: false, video: false, detecting: false };

let a1i_colors: { bg: p5.Color; list: p5.Color; accent: p5.Color };

const a1i_presets: Record<string, IA1IPreset> = {
  default:   { name: 'Default',   conf: 0.50, rate: 0.9, pitch: 1.0 },
  sensitive: { name: 'Sensitive', conf: 0.35, rate: 1.3, pitch: 1.2 },
  cautious:  { name: 'Cautious',  conf: 0.80, rate: 0.7, pitch: 0.8 },
};
let a1i_presetIdx = 0;
let a1i_preset    = a1i_presets['default'];

// Time echoes ??ghost bounding boxes from previous frames
let a1i_echoes:     IDetection[][]          = [];
const a1i_maxEchoes = 5;

// Pixel explosion particles
let a1i_explosions: IExplosionParticle[]   = [];
let a1i_lastLabels: Set<string>            = new Set();

/* ================================================================
   Setup
   ================================================================ */

function setupA1I(): void {
  console.log('A1I - The Observant Shopper setup started');

  window.resizeCanvas(800, 500);
  window.colorMode(window.RGB, 255);

  a1i_colors = {
    bg:     window.color(20, 20, 40),
    list:   window.color(30, 30, 50),
    accent: window.color(0, 255, 100),
  };

  a1i_detections = []; a1i_list.clear(); a1i_listArr = [];
  a1i_echoes = []; a1i_explosions = []; a1i_lastLabels.clear();
  Object.assign(a1i_ready, { model: false, video: false, detecting: false });

  try {
    a1i_video = window.createCapture(window.VIDEO, (): void => {
      a1i_ready.video = true;
      console.log('A1I video ready');
    });
    (a1i_video as unknown as { size: (w: number, h: number) => void }).size(640, 500);
    a1i_video.hide();
  } catch (e: unknown) { console.error('A1I video error:', e); }

  // p5.Speech optional ??check runtime availability
  try {
    const p5Constructor = window.p5 as unknown as Record<string, unknown>;
    if (typeof p5Constructor['Speech'] !== 'undefined') {
      const SpeechCtor = p5Constructor['Speech'] as new () => ISpeechWrapper;
      a1i_speech = new SpeechCtor();
      a1i_speech.setLang('en-US');
      a1i_applyPreset();
    }
  } catch (e: unknown) { console.error('A1I speech error:', e); }

  // ml5 object detector
  try {
    if (typeof ml5 !== 'undefined') {
      a1i_detector = ml5.objectDetector('cocossd', (): void => {
        a1i_ready.model = true;
        console.log('A1I model loaded');
        if (a1i_ready.video) a1i_startDetection();
      });
    }
  } catch (e: unknown) { console.error('A1I ml5 error:', e); }

  console.log('A1I project initialised');
}

/* ================================================================
   Detection loop
   ================================================================ */

function a1i_startDetection(): void {
  if (!a1i_ready.detecting && a1i_ready.model && a1i_ready.video && a1i_detector && a1i_video) {
    a1i_ready.detecting = true;
    (a1i_detector as { detect: (el: p5.Element, cb: (err: Error | null, res: IDetection[]) => void) => void })
      .detect(a1i_video, a1i_gotResults);
  }
}

function a1i_gotResults(error: Error | null, results: IDetection[]): void {
  if (error) { console.error('A1I detection error:', error); return; }

  a1i_detections = results ?? [];

  if (a1i_detections.length > 0) {
    a1i_echoes.push([...a1i_detections]);
    if (a1i_echoes.length > a1i_maxEchoes) a1i_echoes.shift();
  }

  for (const obj of a1i_detections) {
    if (obj.confidence > a1i_preset.conf && !a1i_list.has(obj.label)) {
      a1i_list.add(obj.label);
      a1i_listArr.push(obj.label);

      if (!a1i_lastLabels.has(obj.label)) {
        a1i_createExplosion(obj);
        a1i_lastLabels.add(obj.label);
      }

      if (a1i_speech && !a1i_speech.speaking) {
        try { a1i_speech.speak(obj.label); } catch { /* speech unavailable */ }
      }
    }
  }

  if (a1i_ready.detecting && a1i_detector && a1i_video) {
    (a1i_detector as { detect: (el: p5.Element, cb: (err: Error | null, res: IDetection[]) => void) => void })
      .detect(a1i_video, a1i_gotResults);
  }
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1I(): void {
  window.background(20, 20, 40);

  if (a1i_ready.video && a1i_video) {
    window.image(a1i_video as unknown as p5.Image, 0, 0, 640, 500);
  } else {
    window.fill(255);
    window.textAlign(window.CENTER, window.CENTER);
    window.textSize(24);
    window.text('Initializing camera...', 320, 250);
  }

  a1i_drawEchoes();
  a1i_updateExplosions();

  for (const obj of a1i_detections) { a1i_drawBox(obj); }
  a1i_drawList();
  a1i_drawStatus();

  if (!a1i_ready.detecting && a1i_ready.model && a1i_ready.video) {
    a1i_startDetection();
  }
}

/* ================================================================
   Rendering helpers
   ================================================================ */

function a1i_drawBox(obj: IDetection): void {
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

function a1i_drawList(): void {
  window.push();
  window.noStroke();
  window.fill(30, 30, 50);
  window.rect(640, 0, 160, 500);
  window.fill(240);
  window.textSize(20);
  window.textAlign(window.LEFT, window.TOP);
  window.text('Shopping List', 660, 20);
  window.stroke(0, 255, 100); window.strokeWeight(2);
  window.line(660, 45, 790, 45);
  window.noStroke(); window.textSize(18);

  let y = 60;
  for (let i = 0; i < a1i_listArr.length; i++) {
    if (y > 480) { window.fill(150); window.text('...', 660, y); break; }
    window.fill(255);
    window.text(`${i + 1}. ${a1i_listArr[i]}`, 660, y);
    y += 22;
  }

  if (a1i_listArr.length > 0) {
    window.fill(150); window.textSize(14);
    window.textAlign(window.RIGHT, window.BOTTOM);
    window.text(`Total: ${a1i_listArr.length}`, 790, 490);
  }
  window.pop();
}

function a1i_drawStatus(): void {
  window.push();
  const ok = a1i_ready.model && a1i_ready.video;
  window.fill(ok ? window.color(0, 255, 100) : window.color(255, 200, 0));
  window.noStroke(); window.circle(10, 10, 12);
  window.fill(255); window.textSize(12);
  window.textAlign(window.LEFT, window.TOP);
  window.text(ok ? 'DETECTING' : 'LOADING...', 25, 4);
  window.fill(255, 200); window.textSize(14);
  window.textAlign(window.RIGHT, window.TOP);
  window.text(`Preset: ${a1i_preset.name} (P)`, 790, 10);
  window.pop();
}

/* ================================================================
   Preset cycling
   ================================================================ */

function a1i_applyPreset(): void {
  const keys   = Object.keys(a1i_presets);
  a1i_preset   = a1i_presets[keys[a1i_presetIdx]];

  if (a1i_speech) {
    a1i_speech.setRate(a1i_preset.rate);
    a1i_speech.setPitch(a1i_preset.pitch);
  }
  a1i_list.clear();
  a1i_listArr = [];
}

/* ================================================================
   Visual effects
   ================================================================ */

function a1i_drawEchoes(): void {
  window.push();
  for (let i = 0; i < a1i_echoes.length; i++) {
    const alpha     = window.map(i, 0, a1i_echoes.length - 1, 30, 150);
    const thickness = window.map(i, 0, a1i_echoes.length - 1, 1, 3);
    for (const obj of a1i_echoes[i]) {
      window.noFill();
      window.stroke(0, 255, 100, alpha);
      window.strokeWeight(thickness);
      window.rect(obj.x, obj.y, obj.width, obj.height);
    }
  }
  window.pop();
}

function a1i_createExplosion(obj: IDetection): void {
  const cx = obj.x + obj.width  / 2;
  const cy = obj.y + obj.height / 2;

  for (let i = 0; i < 20; i++) {
    const angle = window.random(window.TWO_PI);
    const speed = window.random(2, 6);
    a1i_explosions.push({
      x: cx, y: cy,
      vx: window.cos(angle) * speed,
      vy: window.sin(angle) * speed,
      size:     window.random(5, 15),
      life:     60, maxLife: 60,
      rotation: window.random(window.TWO_PI),
      rotSpeed: window.random(-0.2, 0.2),
      color:    [window.random(100, 255), 255, 100],
    });
  }
}

function a1i_updateExplosions(): void {
  window.push();
  for (let i = a1i_explosions.length - 1; i >= 0; i--) {
    const p = a1i_explosions[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.95; p.vy *= 0.95;
    p.rotation += p.rotSpeed;
    p.life--;

    const alpha = window.map(p.life, 0, p.maxLife, 0, 255);
    window.push();
    window.translate(p.x, p.y);
    window.rotate(p.rotation);
    window.noStroke();
    window.fill(p.color[0], p.color[1], p.color[2], alpha);
    window.rect(-p.size / 2, -p.size / 2, p.size, p.size);
    window.pop();

    if (p.life <= 0) a1i_explosions.splice(i, 1);
  }
  window.pop();
}

/* ================================================================
   Interaction handlers
   ================================================================ */

function keyPressedA1I(): void {
  if (!window.key) return;
  switch (window.key) {
    case 's': case 'S':
      if (typeof window.saveCanvas === 'function') {
        window.saveCanvas(undefined, `observant-shopper-${a1i_preset.name}`, 'png');
      }
      break;
    case 'c': case 'C':
      a1i_list.clear(); a1i_listArr = [];
      a1i_lastLabels.clear(); a1i_echoes = []; a1i_explosions = [];
      break;
    case 'r': case 'R':
      a1i_ready.detecting = false;
      setTimeout((): void => { a1i_startDetection(); }, 100);
      break;
    case 'e': case 'E':
      for (const obj of a1i_detections) { a1i_createExplosion(obj); }
      break;
    case 'p': case 'P':
      a1i_presetIdx = (a1i_presetIdx + 1) % 3;
      a1i_applyPreset();
      console.log(`A1I preset: ${a1i_preset.name}`);
      break;
  }
}

/* ================================================================
   Cleanup
   ================================================================ */

function cleanupA1I(): void {
  a1i_ready.detecting = false;
  if (a1i_video) { a1i_video.remove(); a1i_video = null; }
  a1i_detections = []; a1i_list.clear(); a1i_listArr = [];
  a1i_detector = null; a1i_speech = null;
  a1i_echoes = []; a1i_explosions = []; a1i_lastLabels.clear();
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1i',
  'A1I - The Observant Shopper',
  setupA1I,
  drawA1I,
  {
    keyPressed:  keyPressedA1I,
    cleanup:     cleanupA1I,
    description: 'ML-powered object detection with voice narration and shopping list. C: clear list, R: restart, E: explode, P: change preset.',
    canvasSize:  { width: 800, height: 500 },
  }
);

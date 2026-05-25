/**
 * A1E ??Sound-Painted Night Sky
 *
 * Uses microphone input (p5.sound AudioIn) to spawn stars whose size
 * and brightness are proportional to the detected audio level.
 *
 * Controls:
 *  Click   ??launch a meteor + ripple from cursor position
 *  A?�Z     ??draw a constellation pattern at cursor position
 *  Space   ??spawn a random star
 *  R       ??reset all objects
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Interfaces
   ================================================================ */

interface IStar {
  x:         number;
  y:         number;
  size:      number;
  brightness: number;
  lifespan:  number;
}

interface IMeteor {
  x:       number;
  y:       number;
  angle:   number;
  speed:   number;
  lifespan: number;
  trail:   Array<{ x: number; y: number }>;
}

interface IConstellation {
  letter:   string;
  x:        number;
  y:        number;
  stars:    Array<{ x: number; y: number; size: number }>;
  lifespan: number;
}

interface IRipple {
  x:      number;
  y:      number;
  radius: number;
  speed:  number;
  alpha:  number;
}

/* ================================================================
   Module state
   ================================================================ */

let stars:          IStar[]          = [];
let meteors:        IMeteor[]        = [];
let constellations: IConstellation[] = [];
let ripples:        IRipple[]        = [];

/** p5.sound microphone ??null when audio is unavailable. */
let mic:            p5.AudioIn | null = null;
let audioLevel      = 0;
let isAudioEnabled  = false;
const audioThreshold = 0.005;

/* ================================================================
   Setup
   ================================================================ */

function setupA1E(): void {
  console.log('A1E - Sound-Painted Night Sky setup started');

  window.textAlign(window.CENTER, window.CENTER);

  // Seed initial stars
  for (let i = 0; i < 20; i++) {
    stars.push({
      x:          window.random(window.width),
      y:          window.random(window.height),
      size:       window.random(2, 4),
      brightness: 255,
      lifespan:   window.random(200, 500),
    });
  }

  // Initialise microphone
  try {
    mic = new p5.AudioIn();
    mic.start();
    isAudioEnabled = true;
    console.log('Microphone initialised');
  } catch (error: unknown) {
    console.warn('Microphone not available ??audio features disabled:', error);
    isAudioEnabled = false;
  }

  console.log('A1E project initialised');
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1E(): void {
  // Update microphone level
  if (isAudioEnabled && mic) {
    audioLevel = mic.getLevel();

    if (audioLevel > audioThreshold) {
      stars.push({
        x:          window.random(0, window.width),
        y:          window.random(0, window.height),
        size:       window.map(audioLevel, 0, 1, 1, 8),
        brightness: window.map(audioLevel, 0, 1, 100, 255),
        lifespan:   window.map(audioLevel, 0, 1, 200, 600),
      });
    }
  }

  window.background(0, 0, 0);

  updateAndDrawStars();
  updateAndDrawMeteors();
  updateAndDrawConstellations();
  updateAndDrawRipples();
  drawUI();
}

/* ================================================================
   Object update helpers
   ================================================================ */

function updateAndDrawStars(): void {
  for (let i = stars.length - 1; i >= 0; i--) {
    const s = stars[i];
    s.lifespan--;

    window.fill(255);
    window.noStroke();
    window.ellipse(s.x, s.y, s.size, s.size);

    if (s.lifespan <= 0) stars.splice(i, 1);
  }
}

function updateAndDrawMeteors(): void {
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
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
    window.ellipse(m.x, m.y, 4, 4);

    if (m.lifespan <= 0 || m.x < 0 || m.x > window.width || m.y < 0 || m.y > window.height) {
      meteors.splice(i, 1);
    }
  }
}

function updateAndDrawConstellations(): void {
  for (let i = constellations.length - 1; i >= 0; i--) {
    const c = constellations[i];
    c.lifespan--;

    c.stars.forEach((s): void => {
      window.fill(255);
      window.noStroke();
      window.ellipse(s.x, s.y, s.size, s.size);
    });

    if (c.lifespan <= 0) constellations.splice(i, 1);
  }
}

function updateAndDrawRipples(): void {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.radius += r.speed;
    r.alpha  -= 2;

    if (r.alpha <= 0) {
      ripples.splice(i, 1);
    } else {
      window.stroke(255, 255, 255, r.alpha);
      window.strokeWeight(2);
      window.noFill();
      window.ellipse(r.x, r.y, r.radius * 2, r.radius * 2);
    }
  }
}

/* ================================================================
   Constellation factory
   ================================================================ */

function createConstellation(letter: string, x: number, y: number): void {
  const size = 20;
  type Pt = { x: number; y: number };
  let pattern: Pt[] = [];

  switch (letter.toUpperCase()) {
    case 'A': pattern = [{x:0,y:10},{x:-5,y:-5},{x:5,y:-5},{x:-3,y:0},{x:3,y:0}]; break;
    case 'B': pattern = [{x:-8,y:-8},{x:-8,y:8},{x:-5,y:-8},{x:-5,y:0},{x:-5,y:8},{x:2,y:-8},{x:2,y:0},{x:2,y:8}]; break;
    case 'C': pattern = [{x:5,y:-8},{x:0,y:-8},{x:-5,y:-5},{x:-8,y:0},{x:-5,y:5},{x:0,y:8},{x:5,y:8}]; break;
    default:  pattern = [{x:0,y:0},{x:5,y:5},{x:-5,y:-5},{x:5,y:-5},{x:-5,y:5}]; break;
  }

  constellations.push({
    letter,
    x, y,
    stars: pattern.map((p): { x: number; y: number; size: number } => ({
      x:    x + p.x * size / 10,
      y:    y + p.y * size / 10,
      size: 3,
    })),
    lifespan: 600,
  });
}

/* ================================================================
   UI overlay
   ================================================================ */

function drawUI(): void {
  window.fill(0, 0, 0, 150);
  window.rect(10, 10, 250, 140);

  window.fill(255, 255, 255);
  window.textSize(12);
  window.textAlign(window.LEFT);
  window.text('Sound-Painted Night Sky', 20, 30);

  if (isAudioEnabled) {
    window.fill(0, 255, 0);
    window.text('Microphone: ON', 20, 50);
    window.fill(255, 255, 255);
    window.text(`Audio Level: ${(audioLevel * 100).toFixed(1)}%`, 20, 70);
  } else {
    window.fill(255, 0, 0);
    window.text('Microphone: OFF', 20, 50);
    window.fill(255, 255, 255);
    window.text('Click to enable microphone', 20, 70);
  }

  window.fill(255, 255, 255);
  window.text(`Stars: ${stars.length}`,                   20, 90);
  window.text(`Meteors: ${meteors.length}`,               20, 110);
  window.text(`Constellations: ${constellations.length}`, 20, 130);

  window.textSize(10);
  window.text('Click: Meteor | A-Z: Constellation | Space: Star | R: Reset', 20, 150);
  window.textAlign(window.CENTER);

  if (isAudioEnabled) {
    window.fill(255, 255, 255, 100);
    window.rect(10, 160, audioLevel * 250, 8);
  }
}

/* ================================================================
   Interaction handlers
   ================================================================ */

function mousePressedA1E(): void {
  meteors.push({
    x: window.mouseX, y: window.mouseY,
    angle:   window.random(-window.PI / 4, window.PI / 4),
    speed:   4,
    lifespan: 60,
    trail:   [],
  });
  ripples.push({ x: window.mouseX, y: window.mouseY, radius: 0, speed: 2, alpha: 255 });
}

function keyPressedA1E(): void {
  const k = window.key;

  if ((k >= 'A' && k <= 'Z') || (k >= 'a' && k <= 'z')) {
    createConstellation(k, window.mouseX, window.mouseY);
  }

  if (k === ' ') {
    stars.push({
      x:          window.random(window.width),
      y:          window.random(window.height),
      size:       window.random(2, 6),
      brightness: 255,
      lifespan:   window.random(300, 600),
    });
  }

  if (k === 'r' || k === 'R') {
    stars = []; meteors = []; constellations = []; ripples = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        x:          window.random(window.width),
        y:          window.random(window.height),
        size:       window.random(2, 4),
        brightness: 255,
        lifespan:   window.random(200, 500),
      });
    }
  }
}

/* ================================================================
   Cleanup ??stop microphone when leaving the project
   ================================================================ */

function cleanupA1E(): void {
  if (mic) {
    mic.stop();
    mic = null;
  }
  isAudioEnabled = false;
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1e',
  'A1E - Sound-Painted Night Sky',
  setupA1E,
  drawA1E,
  {
    mousePressed: mousePressedA1E,
    keyPressed:   keyPressedA1E,
    cleanup:      cleanupA1E,
    description:  'Create a beautiful night sky with voice and interactions. Speak to create stars, click for meteors, type letters for constellations.',
    canvasSize:   { width: 600, height: 400 },
  }
);

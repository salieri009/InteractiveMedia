/**
 * A1B ??Animated Shapes
 *
 * A live animation with a four-quadrant colour background, an animated
 * centre square that lerps between red and blue, and a wave of shapes
 * that drift using Perlin noise.
 *
 * Controls: none (passive animation)
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Module variables
   ================================================================ */

/** Number of shapes in the animated wave. */
let numShapes    = 12;
/** Side length of each shape. */
let shapeSize    = 50;
/** Horizontal spacing between wave shapes. */
let spacing      = 60;
/** Current shape type for the wave. */
let shapeType    = 'ellipse';
/** Side length of the centre square. */
let centerSquareSize = 200;
/** Amplitude of the Perlin-noise wave. */
let waveAmplitude    = 50;

/** Base background colours for the four quadrants. */
let bgColors: Array<{ r: number; g: number; b: number }> = [];

/**
 * Two colour endpoints used for the lerp on the centre square.
 * Stored as plain RGB objects to avoid p5.Color parsing issues.
 */
let mixedColors: Array<p5.Color | { r: number; g: number; b: number }> = [];

/* ================================================================
   Setup
   ================================================================ */

function setupA1B(): void {
  console.log('A1B project setup started');

  window.rectMode(window.CENTER);
  window.colorMode(window.RGB);
  window.noStroke();
  initBackground();
  initMixedColors();

  console.log('A1B project initialised');
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1B(): void {
  drawQuarterBackground();
  drawCenterSquare();
  drawAnimatedShapes();
}

/* ================================================================
   Helpers
   ================================================================ */

/** Populates `bgColors` with the four quadrant base colours. */
function initBackground(): void {
  bgColors = [
    { r: 100, g: 200, b: 200 },
    { r: 200, g: 255, b: 200 },
    { r: 200, g: 200, b: 255 },
    { r: 255, g: 255, b: 200 },
  ];
}

/**
 * Populates `mixedColors` using p5.Color objects when available,
 * falling back to raw RGB structs if the p5 color function is not yet
 * accessible.
 */
function initMixedColors(): void {
  if (typeof window.color === 'function') {
    try {
      mixedColors = [
        window.color(255, 0, 0),
        window.color(0, 0, 255),
      ];
    } catch {
      mixedColors = [
        { r: 255, g: 0,   b: 0 },
        { r: 0,   g: 0,   b: 255 },
      ];
    }
  } else {
    mixedColors = [
      { r: 255, g: 0,   b: 0 },
      { r: 0,   g: 0,   b: 255 },
    ];
  }
}

/**
 * Returns a p5.Color that oscillates between `mixedColors[0]` and
 * `mixedColors[1]` using Perlin-noise-blended lerp values.
 */
function getMixedColor(): p5.Color {
  if (mixedColors.length < 2) initMixedColors();

  const c0 = mixedColors[0];
  const c1 = mixedColors[1];

  /* RGB-object fallback path */
  if ('r' in c0 && 'r' in c1) {
    const t = ((window.sin(window.frameCount * 0.02) + window.cos(window.frameCount * 0.015)) / 2 + 1) / 2;
    return window.color(
      c0.r + (c1.r - c0.r) * t,
      c0.g + (c1.g - c0.g) * t,
      c0.b + (c1.b - c0.b) * t,
    );
  }

  /* p5.Color lerpColor path */
  if (typeof window.lerpColor === 'function') {
    try {
      const t = ((window.sin(window.frameCount * 0.02) + window.cos(window.frameCount * 0.015)) / 2 + 1) / 2;
      return window.lerpColor(c0 as p5.Color, c1 as p5.Color, t);
    } catch {
      return window.color(200, 200, 200);
    }
  }

  return window.color(200, 200, 200);
}

/** Draws four oscillating coloured quadrants. */
function drawQuarterBackground(): void {
  if (bgColors.length === 0) initBackground();

  const w = width / 2;
  const h = height / 2;

  for (let i = 0; i < 4; i++) {
    const base = bgColors[i] ?? { r: 200, g: 200, b: 200 };
    const r = window.constrain(base.r + 20 * window.sin(window.frameCount * 0.005 + i), 0, 255);
    const g = window.constrain(base.g + 20 * window.cos(window.frameCount * 0.006 + i), 0, 255);
    const b = window.constrain(base.b + 20 * window.sin(window.frameCount * 0.007 - i), 0, 255);

    window.fill(r, g, b);

    const x = (i % 2 === 0) ? w / 2 : w + w / 2;
    const y = (i < 2)        ? h / 2 : h + h / 2;
    window.rect(x, y, w, h);
  }
}

/** Draws the lerp-animated centre square. */
function drawCenterSquare(): void {
  window.fill(getMixedColor());
  window.rect(width / 2, height / 2, centerSquareSize, centerSquareSize);
}

/** Draws the Perlin-noise wave of shapes along the vertical midline. */
function drawAnimatedShapes(): void {
  for (let i = 0; i < numShapes; i++) {
    const x = spacing * i + shapeSize / 2;
    const factor = 1 + i * 0.1;
    const y = height / 2
      + window.abs(
          window.pow(window.noise(i * 0.1, window.frameCount * 0.01 * factor) * 2 - 1, 1.5)
        ) * waveAmplitude * (i % 2 === 0 ? 1 : -1);

    const c = window.lerpColor(getMixedColor(), window.color(255, 255, 255), i / numShapes);
    window.fill(c);

    if (shapeType === 'ellipse') {
      window.ellipse(x, y, shapeSize, shapeSize);
    } else {
      window.rect(x, y, shapeSize, shapeSize);
    }
  }
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1b',
  'A1B - Animated Shapes',
  setupA1B,
  drawA1B,
  {
    description: 'An animated project with dynamic shapes and colour transitions.',
    canvasSize:  { width: 800, height: 400 },
  }
);

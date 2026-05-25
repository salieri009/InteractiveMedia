/**
 * A1G ??Interactive Pixel Sort
 *
 * Loads an image (or generates a procedural one), sorts its pixels by
 * brightness or hue, and lets the user paint with sampled colours from
 * the sorted result.
 *
 * Controls:
 *  Mouse drag (over sorted image) ??paint with sampled colour
 *  B       ??sort by brightness
 *  H       ??sort by hue
 *  Space   ??toggle horizontal / vertical sort direction
 *  R       ??regenerate procedural image
 *  C       ??clear trail shapes
 *  L       ??attempt to load an external image
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Interfaces
   ================================================================ */

interface ITrailShape {
  x:     number;
  y:     number;
  color: p5.Color | number;
  size:  number;
  shape: number;
  life:  number;
}

interface IPixelRow {
  r: number; g: number; b: number; a: number; x: number; y: number;
}

/* ================================================================
   Module state
   ================================================================ */

let img:              p5.Graphics | null = null;
let sortedImg:        p5.Image    | null = null;
let currentPixelColor: p5.Color   | null = null;

let sortMode:      'brightness' | 'hue' = 'brightness';
let sortDirection: 'horizontal' | 'vertical' = 'horizontal';

let trailShapes:  ITrailShape[] = [];
const maxTrailShapes = 50;

/* ================================================================
   Setup
   ================================================================ */

function setupA1G(): void {
  console.log('A1G - Interactive Pixel Sort setup started');

  window.colorMode(window.HSB, 360, 100, 100, 100);

  window.loadImage(
    '../assets/images/GQuuuuuux.jpg',
    (loadedImg: p5.Image): void => {
      img       = window.createGraphics(400, 300);
      img.image(loadedImg, 0, 0, 400, 300);
      currentPixelColor = window.color(0);
      sortedImg = (img as unknown as p5.Image).get() as unknown as p5.Image;
      performPixelSort();
    },
    (): void => {
      console.log('Image not found ??using procedural image');
      createProceduralImage();
      currentPixelColor = window.color(0);
      sortedImg = (img as unknown as p5.Image).get() as unknown as p5.Image;
      performPixelSort();
    }
  );

  console.log('A1G project initialised');
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1G(): void {
  if (!img || !sortedImg) {
    window.background(220, 20, 95);
    window.fill(0, 0, 0);
    window.textAlign(window.CENTER, window.CENTER);
    window.textSize(16);
    window.text('Loading image...', width / 2, height / 2);
    return;
  }

  window.background(220, 20, 95);

  const scale   = Math.min(width / 900, height / 600);
  const offsetX = (width  - 900 * scale) / 2;
  const offsetY = (height - 600 * scale) / 2;

  const imgX = 50  * scale + offsetX;
  const imgY = 50  * scale + offsetY;
  const imgW = 400 * scale;
  const imgH = 300 * scale;

  window.image(img, imgX, imgY, imgW, imgH);

  const sortedX = 450 * scale + offsetX;
  const sortedY = 50  * scale + offsetY;
  window.image(sortedImg, sortedX, sortedY, imgW, imgH);

  // Sample colour under cursor when hovering over the sorted image
  const mxInImg = (window.mouseX - sortedX) / scale;
  const myInImg = (window.mouseY - sortedY) / scale;

  if (mxInImg >= 0 && mxInImg < 400 && myInImg >= 0 && myInImg < 300) {
    currentPixelColor = (sortedImg.get(Math.floor(mxInImg), Math.floor(myInImg))) as p5.Color;

    if (window.mouseIsPressed) {
      trailShapes.push({
        x: window.mouseX, y: window.mouseY,
        color: currentPixelColor,
        size:  window.random(10, 30),
        shape: Math.floor(window.random(3)),
        life:  255,
      });
      if (trailShapes.length > maxTrailShapes) trailShapes.shift();
    }
  }

  // Draw trail shapes
  for (let i = trailShapes.length - 1; i >= 0; i--) {
    const shape = trailShapes[i];
    let r = 200; let g = 200; let b = 200;

    if (shape.color instanceof p5.Color || (shape.color && typeof shape.color === 'object')) {
      try {
        r = window.red(shape.color as p5.Color);
        g = window.green(shape.color as p5.Color);
        b = window.blue(shape.color as p5.Color);
      } catch { /* use fallback */ }
    }

    window.fill(r, g, b, shape.life);
    window.noStroke();

    switch (shape.shape) {
      case 0: window.ellipse(shape.x, shape.y, shape.size, shape.size); break;
      case 1: window.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size); break;
      default: window.triangle(
        shape.x, shape.y - shape.size / 2,
        shape.x - shape.size / 2, shape.y + shape.size / 2,
        shape.x + shape.size / 2, shape.y + shape.size / 2
      );
    }

    shape.life -= 3;
    if (shape.life <= 0) trailShapes.splice(i, 1);
  }

  drawPixelSortUI(scale, offsetX, offsetY);
}

/* ================================================================
   Pixel sort algorithm
   ================================================================ */

function performPixelSort(): void {
  if (!sortedImg) return;
  sortedImg.loadPixels();

  if (sortDirection === 'horizontal') {
    for (let y = 0; y < sortedImg.height; y++) {
      const row: IPixelRow[] = [];
      for (let x = 0; x < sortedImg.width; x++) {
        const idx = (x + y * sortedImg.width) * 4;
        row.push({ r: sortedImg.pixels[idx], g: sortedImg.pixels[idx+1], b: sortedImg.pixels[idx+2], a: sortedImg.pixels[idx+3], x, y });
      }
      sortRow(row);
      row.forEach((px, x): void => {
        const idx = (x + y * sortedImg!.width) * 4;
        sortedImg!.pixels[idx]   = px.r;
        sortedImg!.pixels[idx+1] = px.g;
        sortedImg!.pixels[idx+2] = px.b;
        sortedImg!.pixels[idx+3] = px.a;
      });
    }
  } else {
    for (let x = 0; x < sortedImg.width; x++) {
      const col: IPixelRow[] = [];
      for (let y = 0; y < sortedImg.height; y++) {
        const idx = (x + y * sortedImg.width) * 4;
        col.push({ r: sortedImg.pixels[idx], g: sortedImg.pixels[idx+1], b: sortedImg.pixels[idx+2], a: sortedImg.pixels[idx+3], x, y });
      }
      sortRow(col);
      col.forEach((px, y): void => {
        const idx = (x + y * sortedImg!.width) * 4;
        sortedImg!.pixels[idx]   = px.r;
        sortedImg!.pixels[idx+1] = px.g;
        sortedImg!.pixels[idx+2] = px.b;
        sortedImg!.pixels[idx+3] = px.a;
      });
    }
  }

  sortedImg.updatePixels();
}

function sortRow(pixels: IPixelRow[]): void {
  if (sortMode === 'brightness') {
    pixels.sort((a, b): number => (a.r + a.g + a.b) / 3 - (b.r + b.g + b.b) / 3);
  } else {
    pixels.sort((a, b): number =>
      window.hue(window.color(a.r, a.g, a.b)) - window.hue(window.color(b.r, b.g, b.b))
    );
  }
}

/* ================================================================
   Procedural image generator (fallback)
   ================================================================ */

function createProceduralImage(): void {
  img = window.createGraphics(400, 300);
  img.colorMode(window.HSB, 360, 100, 100, 100);
  (img as unknown as { background: (...a: unknown[]) => void }).background(0, 0, 100);

  for (let i = 0; i < 20; i++) {
    (img as unknown as { fill: (...a: unknown[]) => void }).fill(
      window.random(0, 360), window.random(50, 100), window.random(50, 100), 60
    );
    (img as unknown as { noStroke: () => void }).noStroke();

    const shapeType = Math.floor(window.random(3));
    const x    = window.random(400);
    const y    = window.random(300);
    const size = window.random(20, 80);

    if (shapeType === 0) {
      (img as unknown as { ellipse: (...a: number[]) => void }).ellipse(x, y, size, size);
    } else if (shapeType === 1) {
      (img as unknown as { rect: (...a: number[]) => void }).rect(x, y, size, size);
    } else {
      (img as unknown as { triangle: (...a: number[]) => void }).triangle(x, y, x + size/2, y - size, x + size, y);
    }
  }
}

/* ================================================================
   UI overlay
   ================================================================ */

function drawPixelSortUI(scale: number, offsetX: number, offsetY: number): void {
  const uiX = 50  * scale + offsetX;
  const uiY = 380 * scale + offsetY;

  if (currentPixelColor) {
    window.fill(currentPixelColor);
  } else {
    window.fill(0);
  }
  window.stroke(0, 0, 0);
  window.strokeWeight(2);
  window.rect(uiX, uiY, 60 * scale, 60 * scale);

  window.fill(0, 0, 0);
  window.noStroke();
  window.textSize(12 * scale);
  window.textAlign(window.LEFT);

  const textY = 40 * scale + offsetY;
  window.text('Original Image',            uiX,               textY);
  window.text('Pixel Sorted Image',        450 * scale + offsetX, textY);
  window.text('Current Pixel Color',       uiX,               uiY - 5 * scale);

  const instructY = 460 * scale + offsetY;
  window.textSize(10 * scale);
  window.text('Move mouse over sorted image',          uiX, instructY);
  window.text('Click and drag to paint',               uiX, instructY + 15 * scale);

  const infoY = 500 * scale + offsetY;
  window.text(`Sort Mode: ${sortMode}`,                uiX, infoY);
  window.text(`Sort Direction: ${sortDirection}`,      uiX, infoY + 15 * scale);
  window.text("B: brightness | H: hue | SPACE: toggle direction", uiX, infoY + 30 * scale);

  if (currentPixelColor) {
    try {
      const r = window.red(currentPixelColor).toFixed(0);
      const g = window.green(currentPixelColor).toFixed(0);
      const b = window.blue(currentPixelColor).toFixed(0);
      window.text(`RGB: ${r}, ${g}, ${b}`, uiX + 70 * scale, uiY + 30 * scale);
    } catch { /* colour extraction failed */ }
  }

  window.text(`Trail Shapes: ${trailShapes.length}`, uiX, infoY + 60 * scale);
}

/* ================================================================
   Interaction handlers
   ================================================================ */

function mousePressedA1G(): void {
  // Painting is handled inside drawA1G via mouseIsPressed
}

function keyPressedA1G(): void {
  if (!window.key) return;
  switch (window.key) {
    case 'b': case 'B':
      sortMode = 'brightness'; performPixelSort(); break;
    case 'h': case 'H':
      sortMode = 'hue'; performPixelSort(); break;
    case ' ':
      sortDirection = sortDirection === 'horizontal' ? 'vertical' : 'horizontal';
      performPixelSort();
      break;
    case 'r': case 'R':
      createProceduralImage();
      sortedImg = (img as unknown as p5.Image).get() as unknown as p5.Image;
      performPixelSort();
      trailShapes = [];
      break;
    case 'c': case 'C':
      trailShapes = [];
      break;
    case 'l': case 'L':
      window.loadImage(
        './assets/images/sample-image.jpg',
        (loaded: p5.Image): void => {
          img = window.createGraphics(400, 300);
          img.image(loaded, 0, 0, 400, 300);
          sortedImg = (img as unknown as p5.Image).get() as unknown as p5.Image;
          performPixelSort();
        },
        (): void => { console.log('External image not found'); }
      );
      break;
  }
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1g',
  'A1G - Interactive Pixel Sort',
  setupA1G,
  drawA1G,
  {
    mousePressed: mousePressedA1G,
    keyPressed:   keyPressedA1G,
    description:  'Interactive pixel sorting with colour sampling. Move mouse over sorted image to sample colours, click and drag to paint. Use B/H to change sort mode, SPACE to toggle direction.',
    canvasSize:   { width: 800, height: 600 },
  }
);

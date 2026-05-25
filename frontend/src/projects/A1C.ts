/**
 * A1C ??Interactive Pattern Generator
 *
 * Generates four animated geometric patterns (Circular, Grid, Spiral, Radial)
 * in four colour modes (Rainbow, Cool Blue, Warm, Monochrome).
 *
 * Controls:
 *  Click   ??advance pattern type
 *  1-4     ??select pattern
 *  Q/W/E/T ??select colour mode
 *  +/-     ??increase / decrease shape size
 *  Space   ??pause / resume animation
 *  R       ??reset
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Module variables  (a1c_ prefix avoids global conflicts)
   ================================================================ */

let a1c_patternType      = 0;
let a1c_currentColorMode = 0;
let a1c_shapeSize        = 30;
let a1c_spacing          = 40;
let a1c_rotationAngle    = 0;
let a1c_animationSpeed   = 0.02;

/* ================================================================
   Setup
   ================================================================ */

function setupA1C(): void {
  console.log('A1C Pattern Generator initialised');
  a1c_patternType      = 0;
  a1c_currentColorMode = 0;
  a1c_shapeSize        = 30;
  a1c_spacing          = 40;
  a1c_rotationAngle    = 0;
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1C(): void {
  window.background(20, 25, 40);
  a1c_rotationAngle += a1c_animationSpeed;
  drawPattern();
  drawPatternInfo();
}

/* ================================================================
   Pattern drawing helpers
   ================================================================ */

function drawPattern(): void {
  window.push();
  window.translate(width / 2, height / 2);

  switch (a1c_patternType) {
    case 0: drawCircularPattern(); break;
    case 1: drawGridPattern();     break;
    case 2: drawSpiralPattern();   break;
    case 3: drawRadialPattern();   break;
  }

  window.pop();
}

function drawCircularPattern(): void {
  const numShapes = 8;
  const radius    = 80;

  for (let i = 0; i < numShapes; i++) {
    const angle = (window.TWO_PI / numShapes) * i + a1c_rotationAngle;
    const x = window.cos(angle) * radius;
    const y = window.sin(angle) * radius;

    window.push();
    window.translate(x, y);
    window.rotate(a1c_rotationAngle * 2);
    setPatternColor(i);
    drawShape(a1c_shapeSize);
    window.pop();
  }
}

function drawGridPattern(): void {
  const cols   = 6;
  const rows   = 6;
  const startX = -a1c_spacing * (cols - 1) / 2;
  const startY = -a1c_spacing * (rows - 1) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      window.push();
      window.translate(startX + i * a1c_spacing, startY + j * a1c_spacing);
      window.rotate(a1c_rotationAngle + (i + j) * 0.2);
      setPatternColor(i + j);
      drawShape(a1c_shapeSize * (0.5 + window.sin(a1c_rotationAngle + i + j) * 0.3));
      window.pop();
    }
  }
}

function drawSpiralPattern(): void {
  const numPoints = 50;
  const maxRadius = 120;

  for (let i = 0; i < numPoints; i++) {
    const t      = i / numPoints;
    const angle  = t * window.TWO_PI * 3 + a1c_rotationAngle;
    const radius = t * maxRadius;

    window.push();
    window.translate(window.cos(angle) * radius, window.sin(angle) * radius);
    window.rotate(angle);
    setPatternColor(i);
    drawShape(a1c_shapeSize * (1 - t * 0.5));
    window.pop();
  }
}

function drawRadialPattern(): void {
  const numRings          = 4;
  const numShapesPerRing  = 8;

  for (let ring = 0; ring < numRings; ring++) {
    const radius      = (ring + 1) * 40;
    const shapesInRing = numShapesPerRing + ring * 2;

    for (let i = 0; i < shapesInRing; i++) {
      const angle = (window.TWO_PI / shapesInRing) * i + a1c_rotationAngle * (ring + 1);

      window.push();
      window.translate(window.cos(angle) * radius, window.sin(angle) * radius);
      window.rotate(angle + a1c_rotationAngle);
      setPatternColor(ring * 10 + i);
      drawShape(a1c_shapeSize * (1 - ring * 0.2));
      window.pop();
    }
  }
}

function setPatternColor(index: number): void {
  switch (a1c_currentColorMode) {
    case 0: // Rainbow ??use HSB
      window.colorMode(window.HSB, 360, 100, 100);
      window.fill((index * 30 + window.frameCount) % 360, 80, 90);
      window.stroke((index * 30 + window.frameCount) % 360, 80, 60);
      break;
    case 1: // Cool Blue
      window.colorMode(window.RGB, 255);
      window.fill(100 + index * 20, 150 + index * 10, 255, 180);
      window.stroke(50 + index * 10, 100 + index * 5, 200);
      break;
    case 2: // Warm
      window.colorMode(window.RGB, 255);
      window.fill(255, 150 - index * 10, 50 + index * 20, 180);
      window.stroke(200, 100 - index * 5, 30 + index * 10);
      break;
    case 3: { // Monochrome
      window.colorMode(window.RGB, 255);
      const gray = 100 + index * 15;
      window.fill(gray, gray, gray + 50, 180);
      window.stroke(gray - 30, gray - 30, gray);
      break;
    }
  }
  window.strokeWeight(2);
}

function drawShape(size: number): void {
  switch (a1c_patternType) {
    case 0:
    case 2: window.ellipse(0, 0, size, size); break;
    case 1: window.rect(-size / 2, -size / 2, size, size); break;
    case 3: window.triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2); break;
  }
}

function drawPatternInfo(): void {
  window.colorMode(window.RGB, 255);
  window.fill(255, 255, 255, 200);
  window.noStroke();
  window.textAlign(window.LEFT);
  window.textSize(12);

  const lines = [
    `Pattern: ${getPatternName()}`,
    `Color Mode: ${getColorModeName()}`,
    `Size: ${Math.round(a1c_shapeSize)}`,
    '',
    'Controls:',
    '1-4: Change Pattern',
    'Q-T: Change Colors',
    '+/-: Adjust Size',
    'Space: Pause/Resume',
    'R: Reset',
  ];

  lines.forEach((line, i): void => {
    window.text(line, 10, 20 + i * 15);
  });
}

/** Returns the display name of the currently selected pattern. */
function getPatternName(): string {
  return ['Circular', 'Grid', 'Spiral', 'Radial'][a1c_patternType] ?? 'Unknown';
}

/** Returns the display name of the currently selected colour mode. */
function getColorModeName(): string {
  return ['Rainbow', 'Cool Blue', 'Warm', 'Monochrome'][a1c_currentColorMode] ?? 'Unknown';
}

/* ================================================================
   Interaction handlers
   ================================================================ */

function mousePressedA1C(): void {
  a1c_patternType = (a1c_patternType + 1) % 4;
  console.log(`A1C - Pattern: ${getPatternName()}`);
}

function keyPressedA1C(): void {
  if (!window.key) return;
  const k = window.key;

  if (k >= '1' && k <= '4') {
    a1c_patternType = parseInt(k, 10) - 1;
    return;
  }

  switch (k.toLowerCase()) {
    case 'q': a1c_currentColorMode = 0; break;
    case 'w': a1c_currentColorMode = 1; break;
    case 'e': a1c_currentColorMode = 2; break;
    case 't': a1c_currentColorMode = 3; break;
    case '+':
    case '=': a1c_shapeSize = window.min(a1c_shapeSize + 5, 60); break;
    case '-': a1c_shapeSize = window.max(a1c_shapeSize - 5, 10); break;
    case ' ':
      a1c_animationSpeed = a1c_animationSpeed > 0 ? 0 : 0.02;
      break;
    case 'r': setupA1C(); break;
  }
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1c',
  'A1C - Pattern Generator',
  setupA1C,
  drawA1C,
  {
    mousePressed: mousePressedA1C,
    keyPressed:   keyPressedA1C,
    description:  'Interactive pattern generator with multiple modes and animations.',
    canvasSize:   { width: 400, height: 400 },
  }
);

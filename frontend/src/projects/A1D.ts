/**
 * A1D ??Urban Glide
 *
 * A 2-D side-scrolling runner set against a night cityscape.
 * Buildings are stored in a sorted array, demonstrating algorithmic
 * operations (reverse, area-sort) as interactive controls.
 *
 * Controls:
 *  Space  ??jump
 *  R      ??reverse building array
 *  S      ??sort buildings by footprint area
 *  + / =  ??increase scroll speed
 *  -      ??decrease scroll speed
 *  Click  ??jump (alternative)
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Interfaces
   ================================================================ */

interface IBuilding {
  x:     number;
  y:     number;
  w:     number;
  h:     number;
  area:  number;
  color: [number, number, number];
}

interface IPlayer {
  x:        number;
  y:        number;
  w:        number;
  h:        number;
  vy:       number;
  grounded: boolean;
  frame:    number;
}

interface IGame {
  speed:   number;
  score:   number;
  groundY: number;
}

/* ================================================================
   Module state
   ================================================================ */

let buildings: IBuilding[] = [];
let player:    IPlayer;
let game:      IGame;

/* ================================================================
   Setup
   ================================================================ */

function setupA1D(): void {
  console.log('A1D - Urban Glide setup started');

  buildings = [];

  player = { x: 100, y: 280, w: 30, h: 40, vy: 0, grounded: true, frame: 0 };
  game   = { speed: 5, score: 0, groundY: 320 };

  for (let i = 0; i < 12; i++) {
    buildings.push(createBuilding(i * 70 + width));
  }

  console.log('A1D Urban Glide initialised');
}

/* ================================================================
   Building factory
   ================================================================ */

function createBuilding(x: number): IBuilding {
  const w = window.random(30, 80);
  const h = window.random(80, 200);
  return {
    x, y: game.groundY - h, w, h,
    area:  w * h,
    color: [window.random(50, 150), window.random(50, 150), window.random(100, 200)],
  };
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1D(): void {
  window.background(25, 25, 50);

  // Scrolling star field
  window.fill(255, 200);
  for (let i = 0; i < 30; i++) {
    const x = (i * 27 + game.score * 0.1) % width;
    const y = (i * 13) % 150;
    window.ellipse(x, y, 2, 2);
  }

  updateBuildings();

  buildings.forEach((b, i): void => {
    window.fill(b.color[0], b.color[1], b.color[2]);
    window.stroke(255, 100);
    window.rect(b.x, b.y, b.w, b.h);

    // Windows
    window.fill(255, 255, 100, 150);
    for (let wx = 10; wx < b.w - 10; wx += 15) {
      for (let wy = 10; wy < b.h - 10; wy += 20) {
        if (window.random() > 0.6) window.rect(b.x + wx, b.y + wy, 6, 6);
      }
    }

    // Building label
    window.fill(255, 150);
    window.textAlign(window.CENTER);
    const areaInt = Math.floor(b.area);
    window.text(`#${i + 1}\n${areaInt}`, b.x + b.w / 2, b.y + b.h / 2);
  });

  updatePlayer();
  drawPlayer();

  // Ground
  window.fill(60, 60, 60);
  window.rect(0, game.groundY, width, height - game.groundY);

  // HUD
  window.fill(255);
  window.textAlign(window.LEFT);
  const scoreInt   = Math.floor(game.score);
  const playerYInt = Math.floor(player.y);
  window.text(`Score: ${scoreInt} | Speed: ${game.speed} | Buildings: ${buildings.length}`, 10, 20);
  window.text(`Player Y: ${playerYInt} | Grounded: ${player.grounded}`, 10, 40);
  window.text('Controls: SPACE-Jump | R-Reverse | S-Sort | +/- Speed', 10, height - 20);
}

/* ================================================================
   Update helpers
   ================================================================ */

function updateBuildings(): void {
  buildings.forEach((b): void => { b.x -= game.speed; });

  if (buildings[0].x + buildings[0].w < 0) {
    buildings.shift();
    const last = buildings[buildings.length - 1];
    buildings.push(createBuilding(last.x + last.w + window.random(30, 80)));
  }
}

function updatePlayer(): void {
  if (!player.grounded) {
    player.vy += 0.6;
    player.y  += player.vy;

    if (player.y + player.h >= game.groundY) {
      player.y        = game.groundY - player.h;
      player.vy       = 0;
      player.grounded = true;
    }
  }

  player.frame += 0.3;
  if (player.frame > 8) player.frame = 0;

  game.score += game.speed * 0.1;
}

function drawPlayer(): void {
  window.push();
  window.translate(player.x + player.w / 2, player.y + player.h / 2);

  const bob       = player.grounded ? window.sin(player.frame) * 2 : 0;
  const legOffset = player.grounded ? window.sin(player.frame * 2) * 5 : 0;

  // Head
  window.fill(255, 200, 150);
  window.ellipse(0, -15 + bob, 12, 12);

  // Body
  window.fill(0, 255, 136);
  window.ellipse(0, bob, 10, 16);

  // Arms
  window.stroke(255, 200, 150);
  window.strokeWeight(2);
  window.line(0, -5 + bob, -8, 5 + bob);
  window.line(0, -5 + bob,  8, 5 + bob);

  // Legs
  window.stroke(0, 255, 136);
  window.strokeWeight(3);
  if (player.grounded) {
    window.line(0, 8 + bob, -5 + legOffset, 18);
    window.line(0, 8 + bob,  5 - legOffset, 18);
  } else {
    window.line(0, 8, -3, 15);
    window.line(0, 8,  3, 15);
  }

  window.noStroke();
  window.pop();
}

/* ================================================================
   Interaction handlers
   ================================================================ */

function keyPressedA1D(): void {
  if (window.key === ' ' && player.grounded) {
    player.vy       = -12;
    player.grounded = false;
  } else if (window.key === 'r' || window.key === 'R') {
    buildings.reverse();
  } else if (window.key === 's' || window.key === 'S') {
    buildings.sort((a, b): number => a.area - b.area);
  } else if (window.key === '+' || window.key === '=') {
    game.speed = Math.min(game.speed + 0.5, 8);
  } else if (window.key === '-') {
    game.speed = Math.max(game.speed - 0.5, 1);
  }
}

function mousePressedA1D(): void {
  if (player.grounded) {
    player.vy       = -12;
    player.grounded = false;
  }
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1d',
  'A1D - Urban Glide',
  setupA1D,
  drawA1D,
  {
    mousePressed: mousePressedA1D,
    keyPressed:   keyPressedA1D,
    description:  '2D runner game with buildings, jumping mechanics, and interactive controls. Use SPACE to jump, R to reverse, S to sort buildings.',
    canvasSize:   { width: 800, height: 400 },
  }
);

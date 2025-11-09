// A1J - Dungeon Tile Painter & Player

// === CONFIG ===
const GRID_W = 20;
const GRID_H = 14;
const TILE_SIZE = 40;
const PALETTE_H = 80;
const NUM_TREASURES = 5;

// === TILE TYPES ===
const TILES = {
  FLOOR: 0,
  WALL: 1,
  WATER: 2,
  TREASURE: 3,
  SPAWN: 4
};

// === STATE ===
let a1j_grid = [];
let a1j_mode = 'editor'; // 'editor' or 'play'
let a1j_selectedTile = TILES.FLOOR;
let a1j_player = { x: 0, y: 0 };
let a1j_treasureCount = 0;
let a1j_totalTreasures = NUM_TREASURES;
let a1j_waterCooldown = 0;
let a1j_gameWon = false;
let a1j_winTimer = 0;
let a1j_moveCooldown = 0;
const a1j_moveDelay = 10; // frames between moves when key held or to prevent repeats

function setupA1J() {
  resizeCanvas(GRID_W * TILE_SIZE, GRID_H * TILE_SIZE + PALETTE_H);
  
  // Initialize grid
  a1j_grid = [];
  for (let y = 0; y < GRID_H; y++) {
    a1j_grid[y] = [];
    for (let x = 0; x < GRID_W; x++) {
      a1j_grid[y][x] = TILES.FLOOR;
    }
  }
  
  // Set spawn
  a1j_grid[0][0] = TILES.SPAWN;
  a1j_player = { x: 0, y: 0 };
  a1j_treasureCount = 0;
  a1j_waterCooldown = 0;
  a1j_gameWon = false;
  a1j_winTimer = 0;
  a1j_moveCooldown = 0;
}

function drawA1J() {
  background(40);
  
  // Decrease move cooldown
  if (a1j_moveCooldown > 0) a1j_moveCooldown--;
  
  if (a1j_mode === 'editor') {
    a1j_drawEditor();
  } else {
    a1j_drawPlay();
  }
  
  a1j_drawPalette();
  a1j_drawUI();
  
  
  
  // Handle win state
  if (a1j_gameWon) {
    a1j_drawWinScreen();
    a1j_winTimer++;
    if (a1j_winTimer > 180) { // 3 seconds at 60fps
      a1j_mode = 'editor';
      a1j_gameWon = false;
      a1j_winTimer = 0;
    }
  }
}

function a1j_drawEditor() {
  // Draw grid
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      a1j_drawTile(x, y, a1j_grid[y][x]);
    }
  }
  
  // Paint on mouse drag
  if (mouseIsPressed && mouseY < GRID_H * TILE_SIZE) {
    let gx = floor(mouseX / TILE_SIZE);
    let gy = floor(mouseY / TILE_SIZE);
    if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
      a1j_grid[gy][gx] = a1j_selectedTile;
    }
  }
}

function a1j_drawPlay() {
  // Draw grid
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      a1j_drawTile(x, y, a1j_grid[y][x]);
    }
  }
  
  // Draw player
  push();
  fill(255, 100, 200);
  noStroke();
  circle(a1j_player.x * TILE_SIZE + TILE_SIZE / 2, 
         a1j_player.y * TILE_SIZE + TILE_SIZE / 2, 
         TILE_SIZE * 0.7);
  pop();
}

function a1j_drawTile(x, y, type) {
  let px = x * TILE_SIZE;
  let py = y * TILE_SIZE;
  
  push();
  strokeWeight(1);
  stroke(60);
  
  switch(type) {
    case TILES.FLOOR:
      fill(200, 200, 200);
      rect(px, py, TILE_SIZE, TILE_SIZE);
      break;
    case TILES.WALL:
      fill(50, 50, 50);
      rect(px, py, TILE_SIZE, TILE_SIZE);
      break;
    case TILES.WATER:
      fill(50, 100, 200);
      rect(px, py, TILE_SIZE, TILE_SIZE);
      break;
    case TILES.TREASURE:
      fill(200, 200, 200);
      rect(px, py, TILE_SIZE, TILE_SIZE);
      fill(255, 220, 0);
      noStroke();
      circle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.5);
      break;
    case TILES.SPAWN:
      fill(200, 200, 200);
      rect(px, py, TILE_SIZE, TILE_SIZE);
      fill(0, 255, 100);
      noStroke();
      circle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE * 0.3);
      break;
  }
  pop();
}

function a1j_drawPalette() {
  let py = GRID_H * TILE_SIZE;
  
  // Background
  push();
  fill(30, 30, 40);
  noStroke();
  rect(0, py, width, PALETTE_H);
  pop();
  
  // Tile buttons (Treasure removed in editor mode)
  let tiles = [
    { type: TILES.FLOOR, name: 'Floor', color: [200, 200, 200] },
    { type: TILES.WALL, name: 'Wall', color: [50, 50, 50] },
    { type: TILES.WATER, name: 'Water', color: [50, 100, 200] },
    { type: TILES.SPAWN, name: 'Spawn', color: [0, 255, 100] }
  ];
  
  for (let i = 0; i < tiles.length; i++) {
    let x = 20 + i * 140;
    let y = py + 20;
    let w = 120;
    let h = 50;
    
    push();
    if (a1j_mode === 'editor' && a1j_selectedTile === tiles[i].type) {
      strokeWeight(3);
      stroke(255, 255, 0);
    } else {
      strokeWeight(1);
      stroke(100);
    }
    fill(tiles[i].color);
    rect(x, y, w, h);
    
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text(tiles[i].name, x + w / 2, y + h / 2);
    pop();
  }
}

function a1j_drawUI() {
  let py = GRID_H * TILE_SIZE;
  
  push();
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  
  if (a1j_mode === 'editor') {
    text('EDITOR MODE | P: Play | S: Save | L: Load | D: Download', 10, py + 5);
  } else {
    text(`PLAY MODE | WASD: Move | Treasures: ${a1j_treasureCount}/${a1j_totalTreasures}`, 10, py + 5);
  }
  pop();
}

function a1j_drawWinScreen() {
  push();
  fill(0, 0, 0, 200);
  noStroke();
  rect(0, 0, width, GRID_H * TILE_SIZE);
  
  fill(255, 220, 0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text('🎉 YOU WIN! 🎉', width / 2, (GRID_H * TILE_SIZE) / 2);
  
  textSize(24);
  fill(255);
  text('Returning to editor...', width / 2, (GRID_H * TILE_SIZE) / 2 + 60);
  pop();
}

function keyPressedA1J() {
  // P key: Start play mode
  if (key === 'p' || key === 'P') {
    if (a1j_mode === 'editor') {
      a1j_startPlay();
    }
    return;
  }
  
  // Editor controls
  if (a1j_mode === 'editor') {
    if (key === 's' || key === 'S') a1j_save();
    if (key === 'l' || key === 'L') a1j_load();
    if (key === 'd' || key === 'D') a1j_download();
    return; // Prevent fall-through to play controls
  }
  
  // Play controls - single-step per keypress
  if (a1j_mode === 'play' && !a1j_gameWon) {
    // If water cooldown active, consume one press and skip movement
    if (a1j_waterCooldown > 0) {
      a1j_waterCooldown--;
      return;
    }

    // Prevent rapid repeated moves; only allow if cooldown is zero
    if (a1j_moveCooldown > 0) return;

    let newX = a1j_player.x;
    let newY = a1j_player.y;
    let moved = false;

    if (key === 'w' || key === 'W') { newY--; moved = true; }
    else if (key === 's' || key === 'S') { newY++; moved = true; }
    else if (key === 'a' || key === 'A') { newX--; moved = true; }
    else if (key === 'd' || key === 'D') { newX++; moved = true; }

    if (!moved) return;

    // Check bounds
    if (newX < 0 || newX >= GRID_W || newY < 0 || newY >= GRID_H) return;

    // Check collision
    let tile = a1j_grid[newY][newX];
    if (tile === TILES.WALL) return;

    // Movement is valid — perform it
    a1j_player.x = newX;
    a1j_player.y = newY;

    // Set move cooldown so holding a key doesn't teleport the player
    a1j_moveCooldown = a1j_moveDelay;

    // Interactions
    if (tile === TILES.TREASURE) {
      a1j_grid[newY][newX] = TILES.FLOOR;
      a1j_treasureCount++;
      if (a1j_treasureCount >= a1j_totalTreasures) {
        a1j_gameWon = true;
        a1j_winTimer = 0;
      }
    }

    if (tile === TILES.WATER) {
      a1j_waterCooldown = 1; // Skip next key press
    }
  }
}

function mousePressedA1J() {
  if (a1j_mode !== 'editor') return;
  
  let py = GRID_H * TILE_SIZE;
  
  // Check palette clicks
  if (mouseY > py && mouseY < py + PALETTE_H) {
    let tiles = [TILES.FLOOR, TILES.WALL, TILES.WATER, TILES.SPAWN];
    for (let i = 0; i < tiles.length; i++) {
      let x = 20 + i * 140;
      let y = py + 20;
      if (mouseX > x && mouseX < x + 120 && mouseY > y && mouseY < y + 50) {
        a1j_selectedTile = tiles[i];
      }
    }
  }
}

function a1j_startPlay() {
  // Clear all existing treasures
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (a1j_grid[y][x] === TILES.TREASURE) {
        a1j_grid[y][x] = TILES.FLOOR;
      }
    }
  }
  
  // Generate random treasures
  let treasuresPlaced = 0;
  let attempts = 0;
  while (treasuresPlaced < NUM_TREASURES && attempts < 1000) {
    let x = floor(random(GRID_W));
    let y = floor(random(GRID_H));
    
    // Only place on floor tiles
    if (a1j_grid[y][x] === TILES.FLOOR) {
      a1j_grid[y][x] = TILES.TREASURE;
      treasuresPlaced++;
    }
    attempts++;
  }
  
  // Find spawn point
  let found = false;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (a1j_grid[y][x] === TILES.SPAWN) {
        a1j_player = { x: x, y: y };
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (!found) a1j_player = { x: 0, y: 0 };
  
  a1j_treasureCount = 0;
  a1j_totalTreasures = treasuresPlaced;
  a1j_waterCooldown = 0;
  a1j_moveCooldown = 0;
  a1j_gameWon = false;
  a1j_winTimer = 0;
  a1j_mode = 'play';
  
  console.log(`🎮 Play mode started! ${treasuresPlaced} treasures placed.`);
}

function a1j_save() {
  localStorage.setItem('a1j_tilemap', JSON.stringify(a1j_grid));
  console.log('✅ Map saved to localStorage');
}

function a1j_load() {
  let data = localStorage.getItem('a1j_tilemap');
  if (data) {
    a1j_grid = JSON.parse(data);
    console.log('✅ Map loaded from localStorage');
  }
}

function a1j_download() {
  let json = JSON.stringify(a1j_grid, null, 2);
  let blob = new Blob([json], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'tilemap.json';
  a.click();
  console.log('✅ Map downloaded as tilemap.json');
}

// Register the project
if (typeof projectManager !== 'undefined') {
  projectManager.registerProject('a1j', 'A1J - Dungeon Tile Painter', setupA1J, drawA1J, {
    keyPressed: keyPressedA1J,
    mousePressed: mousePressedA1J
  });
} else {
  console.error('ProjectManager not found. Make sure ProjectManager.js is loaded first.');
}

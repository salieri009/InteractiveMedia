/**
 * A1J - Dungeon Tile Painter & Player
 * 
 * Architecture: Model-View-Controller (MVC)
 * - GameModel: Manages game state, logic, and data
 * - GameView: Handles all rendering using p5.js
 * - GameController: Orchestrates input handling and updates
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const A1J_CONFIG = {
  GRID_WIDTH: 20,
  GRID_HEIGHT: 14,
  TILE_SIZE: 40,
  PALETTE_HEIGHT: 80,
  NUM_TREASURES: 5,
  MOVE_DELAY: 10,
  WIN_TIMER_MAX: 180
};

const TILE_TYPES = {
  FLOOR: 0,
  WALL: 1,
  WATER: 2,
  TREASURE: 3,
  SPAWN: 4
};

// ============================================================================
// GAME MODEL - Manages all game state and business logic
// ============================================================================

/**
 * GameModel encapsulates all game state and business logic.
 * It is completely independent of p5.js and rendering concerns.
 */
class GameModel {
  constructor(config) {
    this.config = config;
    this.grid = [];
    this.mode = 'editor'; // 'editor' or 'play'
    this.selectedTile = TILE_TYPES.FLOOR;
    this.player = { x: 0, y: 0 };
    this.treasureCount = 0;
    this.totalTreasures = config.NUM_TREASURES;
    this.waterCooldown = 0;
    this.gameWon = false;
    this.winTimer = 0;
    this.moveCooldown = 0;
    
    this.initializeGrid();
  }

  /**
   * Initialize the grid with all floor tiles and a spawn point.
   */
  initializeGrid() {
    this.grid = [];
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        this.grid[y][x] = TILE_TYPES.FLOOR;
      }
    }
    this.grid[0][0] = TILE_TYPES.SPAWN;
    this.player = { x: 0, y: 0 };
    this.treasureCount = 0;
    this.waterCooldown = 0;
    this.gameWon = false;
    this.winTimer = 0;
    this.moveCooldown = 0;
  }

  /**
   * Reset for a new game session (keeping the editor map).
   */
  resetForPlay() {
    // Clear all treasures
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        if (this.grid[y][x] === TILE_TYPES.TREASURE) {
          this.grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }

    // Generate random treasures on floor tiles
    let treasuresPlaced = 0;
    let attempts = 0;
    while (treasuresPlaced < this.config.NUM_TREASURES && attempts < 1000) {
      let x = floor(random(this.config.GRID_WIDTH));
      let y = floor(random(this.config.GRID_HEIGHT));
      
      if (this.grid[y][x] === TILE_TYPES.FLOOR) {
        this.grid[y][x] = TILE_TYPES.TREASURE;
        treasuresPlaced++;
      }
      attempts++;
    }

    // Find spawn point and place player there
    let found = false;
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        if (this.grid[y][x] === TILE_TYPES.SPAWN) {
          this.player = { x, y };
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) this.player = { x: 0, y: 0 };

    // Reset game state
    this.treasureCount = 0;
    this.totalTreasures = treasuresPlaced;
    this.waterCooldown = 0;
    this.moveCooldown = 0;
    this.gameWon = false;
    this.winTimer = 0;
    this.mode = 'play';

    console.log(`🎮 Play mode started! ${treasuresPlaced} treasures placed.`);
  }

  /**
   * Attempt to move the player by (dx, dy).
   * Returns true if move was successful, false otherwise.
   */
  movePlayer(dx, dy) {
    // If water cooldown is active, consume it and prevent movement
    if (this.waterCooldown > 0) {
      this.waterCooldown--;
      return false;
    }

    // If move cooldown is active, prevent movement
    if (this.moveCooldown > 0) {
      return false;
    }

    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= this.config.GRID_WIDTH ||
        newY < 0 || newY >= this.config.GRID_HEIGHT) {
      return false;
    }

    const tile = this.grid[newY][newX];

    // Check collision with walls
    if (tile === TILE_TYPES.WALL) {
      return false;
    }

    // Movement is valid — update player position
    this.player.x = newX;
    this.player.y = newY;

    // Apply move cooldown
    this.moveCooldown = this.config.MOVE_DELAY;

    // Handle tile interactions
    if (tile === TILE_TYPES.TREASURE) {
      this.grid[newY][newX] = TILE_TYPES.FLOOR;
      this.treasureCount++;
      if (this.treasureCount >= this.totalTreasures) {
        this.gameWon = true;
        this.winTimer = 0;
      }
    }

    if (tile === TILE_TYPES.WATER) {
      this.waterCooldown = 1; // Skip next key press
    }

    return true;
  }

  /**
   * Place a tile at the given position in editor mode.
   */
  placeTile(x, y, tileType) {
    if (x >= 0 && x < this.config.GRID_WIDTH &&
        y >= 0 && y < this.config.GRID_HEIGHT) {
      this.grid[y][x] = tileType;
    }
  }

  /**
   * Select a tile type for painting.
   */
  selectTile(tileType) {
    this.selectedTile = tileType;
  }

  /**
   * Switch between editor and play modes.
   */
  switchMode(newMode) {
    this.mode = newMode;
  }

  /**
   * Update game state (e.g., decrement cooldowns).
   */
  update() {
    if (this.moveCooldown > 0) this.moveCooldown--;
    if (this.gameWon) this.winTimer++;
  }

  /**
   * Public getters for accessing state (read-only for the view).
   */
  getGrid() { return this.grid; }
  getMode() { return this.mode; }
  getPlayer() { return this.player; }
  getTreasureProgress() { return { current: this.treasureCount, total: this.totalTreasures }; }
  isGameWon() { return this.gameWon; }
  getWinTimer() { return this.winTimer; }
  getSelectedTile() { return this.selectedTile; }

  /**
   * Persistence: Save to localStorage
   */
  save() {
    localStorage.setItem('a1j_tilemap', JSON.stringify(this.grid));
    console.log('✅ Map saved to localStorage');
  }

  /**
   * Persistence: Load from localStorage
   */
  load() {
    const data = localStorage.getItem('a1j_tilemap');
    if (data) {
      this.grid = JSON.parse(data);
      console.log('✅ Map loaded from localStorage');
    }
  }

  /**
   * Export: Download map as JSON file
   */
  download() {
    const json = JSON.stringify(this.grid, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tilemap.json';
    a.click();
    console.log('✅ Map downloaded as tilemap.json');
  }
}

// ============================================================================
// GAME VIEW - Handles all rendering with p5.js
// ============================================================================

/**
 * GameView is responsible for rendering the game state.
 * It reads from the GameModel and uses p5.js to draw everything.
 */
class GameView {
  constructor(model, config) {
    this.model = model;
    this.config = config;
  }

  /**
   * Main render method called each frame.
   */
  render() {
    background(40);

    if (this.model.getMode() === 'editor') {
      this.renderEditor();
    } else {
      this.renderPlay();
    }

    this.renderPalette();
    this.renderUI();

    if (this.model.isGameWon()) {
      this.renderWinScreen();
    }
  }

  /**
   * Render the editor view with the full grid.
   */
  renderEditor() {
    const grid = this.model.getGrid();
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        this.renderTile(x, y, grid[y][x]);
      }
    }
  }

  /**
   * Render the play view with grid and player.
   */
  renderPlay() {
    const grid = this.model.getGrid();
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        this.renderTile(x, y, grid[y][x]);
      }
    }

    this.renderPlayer();
  }

  /**
   * Render a single tile.
   */
  renderTile(x, y, type) {
    const px = x * this.config.TILE_SIZE;
    const py = y * this.config.TILE_SIZE;

    push();
    strokeWeight(1);
    stroke(60);

    switch (type) {
      case TILE_TYPES.FLOOR:
        fill(200, 200, 200);
        rect(px, py, this.config.TILE_SIZE, this.config.TILE_SIZE);
        break;
      case TILE_TYPES.WALL:
        fill(50, 50, 50);
        rect(px, py, this.config.TILE_SIZE, this.config.TILE_SIZE);
        break;
      case TILE_TYPES.WATER:
        fill(50, 100, 200);
        rect(px, py, this.config.TILE_SIZE, this.config.TILE_SIZE);
        break;
      case TILE_TYPES.TREASURE:
        fill(200, 200, 200);
        rect(px, py, this.config.TILE_SIZE, this.config.TILE_SIZE);
        fill(255, 220, 0);
        noStroke();
        circle(px + this.config.TILE_SIZE / 2, 
               py + this.config.TILE_SIZE / 2, 
               this.config.TILE_SIZE * 0.5);
        break;
      case TILE_TYPES.SPAWN:
        fill(200, 200, 200);
        rect(px, py, this.config.TILE_SIZE, this.config.TILE_SIZE);
        fill(0, 255, 100);
        noStroke();
        circle(px + this.config.TILE_SIZE / 2, 
               py + this.config.TILE_SIZE / 2, 
               this.config.TILE_SIZE * 0.3);
        break;
    }
    pop();
  }

  /**
   * Render the player character.
   */
  renderPlayer() {
    const player = this.model.getPlayer();
    const px = player.x * this.config.TILE_SIZE + this.config.TILE_SIZE / 2;
    const py = player.y * this.config.TILE_SIZE + this.config.TILE_SIZE / 2;

    push();
    fill(255, 100, 200);
    noStroke();
    circle(px, py, this.config.TILE_SIZE * 0.7);
    pop();
  }

  /**
   * Render the tile selection palette.
   */
  renderPalette() {
    const py = this.config.GRID_HEIGHT * this.config.TILE_SIZE;

    // Background
    push();
    fill(30, 30, 40);
    noStroke();
    rect(0, py, width, this.config.PALETTE_HEIGHT);
    pop();

    // Tile buttons
    const tileOptions = [
      { type: TILE_TYPES.FLOOR, name: 'Floor', color: [200, 200, 200] },
      { type: TILE_TYPES.WALL, name: 'Wall', color: [50, 50, 50] },
      { type: TILE_TYPES.WATER, name: 'Water', color: [50, 100, 200] },
      { type: TILE_TYPES.SPAWN, name: 'Spawn', color: [0, 255, 100] }
    ];

    for (let i = 0; i < tileOptions.length; i++) {
      const x = 20 + i * 140;
      const y = py + 20;
      const w = 120;
      const h = 50;

      push();
      if (this.model.getMode() === 'editor' && 
          this.model.getSelectedTile() === tileOptions[i].type) {
        strokeWeight(3);
        stroke(255, 255, 0);
      } else {
        strokeWeight(1);
        stroke(100);
      }
      fill(tileOptions[i].color);
      rect(x, y, w, h);

      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(12);
      text(tileOptions[i].name, x + w / 2, y + h / 2);
      pop();
    }
  }

  /**
   * Render the UI text (mode info and instructions).
   */
  renderUI() {
    const py = this.config.GRID_HEIGHT * this.config.TILE_SIZE;

    push();
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);

    if (this.model.getMode() === 'editor') {
      text('EDITOR MODE | P: Play | S: Save | L: Load | D: Download', 10, py + 5);
    } else {
      const progress = this.model.getTreasureProgress();
      text(`PLAY MODE | WASD: Move | Treasures: ${progress.current}/${progress.total}`, 10, py + 5);
    }
    pop();
  }

  /**
   * Render the win screen overlay.
   */
  renderWinScreen() {
    push();
    fill(0, 0, 0, 200);
    noStroke();
    rect(0, 0, width, this.config.GRID_HEIGHT * this.config.TILE_SIZE);

    fill(255, 220, 0);
    textAlign(CENTER, CENTER);
    textSize(48);
    text('🎉 YOU WIN! 🎉', width / 2, 
         (this.config.GRID_HEIGHT * this.config.TILE_SIZE) / 2);

    textSize(24);
    fill(255);
    text('Returning to editor...', width / 2, 
         (this.config.GRID_HEIGHT * this.config.TILE_SIZE) / 2 + 60);
    pop();
  }
}

// ============================================================================
// GAME CONTROLLER - Orchestrates input and updates
// ============================================================================

/**
 * GameController handles user input and coordinates the Model and View.
 * It bridges p5.js events with the game logic.
 */
class GameController {
  constructor(model, view, config) {
    this.model = model;
    this.view = view;
    this.config = config;
  }

  /**
   * Update the game state (called once per frame).
   */
  update() {
    this.model.update();
    this.view.render();
  }

  /**
   * Handle keyboard input.
   */
  handleKeyPressed(key) {
    // P key: Toggle play mode
    if (key === 'p' || key === 'P') {
      if (this.model.getMode() === 'editor') {
        this.model.resetForPlay();
      }
      return;
    }

    // Editor controls
    if (this.model.getMode() === 'editor') {
      if (key === 's' || key === 'S') {
        this.model.save();
      }
      if (key === 'l' || key === 'L') {
        this.model.load();
      }
      if (key === 'd' || key === 'D') {
        this.model.download();
      }
      return;
    }

    // Play controls - WASD movement
    if (this.model.getMode() === 'play' && !this.model.isGameWon()) {
      if (key === 'w' || key === 'W') {
        this.model.movePlayer(0, -1);
      } else if (key === 's' || key === 'S') {
        this.model.movePlayer(0, 1);
      } else if (key === 'a' || key === 'A') {
        this.model.movePlayer(-1, 0);
      } else if (key === 'd' || key === 'D') {
        this.model.movePlayer(1, 0);
      }
    }
  }

  /**
   * Handle mouse input.
   */
  handleMousePressed(mx, my) {
    if (this.model.getMode() !== 'editor') return;

    const gameGridHeight = this.config.GRID_HEIGHT * this.config.TILE_SIZE;
    const paletteY = gameGridHeight;

    // Check if click is in the game grid area (painting)
    if (my < gameGridHeight) {
      const gx = floor(mx / this.config.TILE_SIZE);
      const gy = floor(my / this.config.TILE_SIZE);
      this.model.placeTile(gx, gy, this.model.getSelectedTile());
      return;
    }

    // Check if click is in the palette area (tile selection)
    if (my > paletteY && my < paletteY + this.config.PALETTE_HEIGHT) {
      const tileOptions = [
        TILE_TYPES.FLOOR,
        TILE_TYPES.WALL,
        TILE_TYPES.WATER,
        TILE_TYPES.SPAWN
      ];

      for (let i = 0; i < tileOptions.length; i++) {
        const x = 20 + i * 140;
        const y = paletteY + 20;
        const w = 120;
        const h = 50;

        if (mx > x && mx < x + w && my > y && my < y + h) {
          this.model.selectTile(tileOptions[i]);
          return;
        }
      }
    }
  }

  /**
   * Handle mouse dragging for continuous painting in editor.
   */
  handleMouseDrag(mx, my) {
    if (this.model.getMode() !== 'editor') return;

    const gameGridHeight = this.config.GRID_HEIGHT * this.config.TILE_SIZE;
    if (my < gameGridHeight) {
      const gx = floor(mx / this.config.TILE_SIZE);
      const gy = floor(my / this.config.TILE_SIZE);
      this.model.placeTile(gx, gy, this.model.getSelectedTile());
    }
  }
}

// ============================================================================
// p5.js SKETCH INTEGRATION
// ============================================================================

// Global instances
let a1j_gameModel;
let a1j_gameView;
let a1j_gameController;

function setupA1J() {
  resizeCanvas(
    A1J_CONFIG.GRID_WIDTH * A1J_CONFIG.TILE_SIZE,
    A1J_CONFIG.GRID_HEIGHT * A1J_CONFIG.TILE_SIZE + A1J_CONFIG.PALETTE_HEIGHT
  );

  // Instantiate MVC components
  a1j_gameModel = new GameModel(A1J_CONFIG);
  a1j_gameView = new GameView(a1j_gameModel, A1J_CONFIG);
  a1j_gameController = new GameController(a1j_gameModel, a1j_gameView, A1J_CONFIG);
}

function drawA1J() {
  a1j_gameController.update();

  // Handle win state transition (auto-return to editor after 3 seconds)
  if (a1j_gameModel.isGameWon() && a1j_gameModel.getWinTimer() > A1J_CONFIG.WIN_TIMER_MAX) {
    a1j_gameModel.switchMode('editor');
  }
}

function keyPressedA1J() {
  a1j_gameController.handleKeyPressed(key);
}

function mousePressedA1J() {
  a1j_gameController.handleMousePressed(mouseX, mouseY);
}

// p5.js global draw loop will handle mouse dragging
// but we can optionally add support by checking mouseIsPressed
function drawA1J_handleDrag() {
  if (mouseIsPressed) {
    a1j_gameController.handleMouseDrag(mouseX, mouseY);
  }
}

// Update draw function to include drag handling
const originalDrawA1J = drawA1J;
function drawA1J() {
  originalDrawA1J();
  drawA1J_handleDrag();
}

// ============================================================================
// PROJECT MANAGER REGISTRATION
// ============================================================================

if (typeof projectManager !== 'undefined') {
  projectManager.registerProject('a1j', 'A1J - Dungeon Tile Painter', setupA1J, drawA1J, {
    keyPressed: keyPressedA1J,
    mousePressed: mousePressedA1J
  });
} else {
  console.error('ProjectManager not found. Make sure ProjectManager.js is loaded first.');
}

/**
 * A1J ??Dungeon Tile Painter & Player
 *
 * Architecture: Model-View-Controller (MVC)
 *  - GameModel      ??game state, logic, persistence
 *  - GameView       ??all p5.js rendering
 *  - GameController ??input routing and frame update
 *
 * Controls:
 *  Editor mode: Click grid  ??paint selected tile
 *               Click palette ??select tile type
 *               P ??start play mode
 *               S ??save to localStorage
 *               L ??load from localStorage
 *               D ??download map as JSON
 *  Play mode:   WASD ??move player
 *               Collect all treasures to win
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Configuration
   ================================================================ */

interface IA1JConfig {
  GRID_WIDTH:    number;
  GRID_HEIGHT:   number;
  TILE_SIZE:     number;
  PALETTE_HEIGHT: number;
  NUM_TREASURES: number;
  MOVE_DELAY:    number;
  WIN_TIMER_MAX: number;
}

const A1J_CONFIG: IA1JConfig = {
  GRID_WIDTH:    20,
  GRID_HEIGHT:   14,
  TILE_SIZE:     40,
  PALETTE_HEIGHT: 80,
  NUM_TREASURES: 5,
  MOVE_DELAY:    10,
  WIN_TIMER_MAX: 180,
};

const TILE_TYPES = {
  FLOOR:   0,
  WALL:    1,
  WATER:   2,
  TREASURE: 3,
  SPAWN:   4,
} as const;

type TileType = typeof TILE_TYPES[keyof typeof TILE_TYPES];

/* ================================================================
   GameModel
   ================================================================ */

/**
 * Manages all game state and business logic.
 * Completely independent of p5.js and rendering concerns.
 */
class GameModel {
  private readonly config:   IA1JConfig;
  private grid:              TileType[][];
  private mode:              'editor' | 'play';
  private selectedTile:      TileType;
  private player:            { x: number; y: number };
  private treasureCount:     number;
  private totalTreasures:    number;
  private waterCooldown:     number;
  private _gameWon:          boolean;
  private winTimer:          number;
  private moveCooldown:      number;

  constructor(config: IA1JConfig) {
    this.config         = config;
    this.grid           = [];
    this.mode           = 'editor';
    this.selectedTile   = TILE_TYPES.FLOOR;
    this.player         = { x: 0, y: 0 };
    this.treasureCount  = 0;
    this.totalTreasures = config.NUM_TREASURES;
    this.waterCooldown  = 0;
    this._gameWon       = false;
    this.winTimer       = 0;
    this.moveCooldown   = 0;

    this.initializeGrid();
  }

  /** Fills the grid with floor tiles and places a spawn point at (0, 0). */
  initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        this.grid[y][x] = TILE_TYPES.FLOOR;
      }
    }
    this.grid[0][0]     = TILE_TYPES.SPAWN;
    this.player         = { x: 0, y: 0 };
    this.treasureCount  = 0;
    this.waterCooldown  = 0;
    this._gameWon       = false;
    this.winTimer       = 0;
    this.moveCooldown   = 0;
  }

  /** Clears old treasures, places new random treasures, and resets play state. */
  resetForPlay(): void {
    // Clear previous treasures
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        if (this.grid[y][x] === TILE_TYPES.TREASURE) {
          this.grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }

    // Randomly place new treasures on floor tiles
    let treasuresPlaced = 0;
    let attempts        = 0;
    while (treasuresPlaced < this.config.NUM_TREASURES && attempts < 1000) {
      const tx = window.floor(window.random(this.config.GRID_WIDTH));
      const ty = window.floor(window.random(this.config.GRID_HEIGHT));
      if (this.grid[ty][tx] === TILE_TYPES.FLOOR) {
        this.grid[ty][tx] = TILE_TYPES.TREASURE;
        treasuresPlaced++;
      }
      attempts++;
    }

    // Place player at spawn
    let found = false;
    for (let y = 0; y < this.config.GRID_HEIGHT && !found; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH && !found; x++) {
        if (this.grid[y][x] === TILE_TYPES.SPAWN) {
          this.player = { x, y };
          found = true;
        }
      }
    }
    if (!found) this.player = { x: 0, y: 0 };

    this.treasureCount  = 0;
    this.totalTreasures = treasuresPlaced;
    this.waterCooldown  = 0;
    this.moveCooldown   = 0;
    this._gameWon       = false;
    this.winTimer       = 0;
    this.mode           = 'play';
    console.log(`A1J play mode: ${treasuresPlaced} treasures placed`);
  }

  /**
   * Attempts to move the player by (dx, dy).
   * @returns true if the move succeeded
   */
  movePlayer(dx: number, dy: number): boolean {
    if (this.waterCooldown > 0) { this.waterCooldown--; return false; }
    if (this.moveCooldown  > 0) { return false; }

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    if (nx < 0 || nx >= this.config.GRID_WIDTH || ny < 0 || ny >= this.config.GRID_HEIGHT) return false;

    const tile = this.grid[ny][nx];
    if (tile === TILE_TYPES.WALL) return false;

    this.player.x     = nx;
    this.player.y     = ny;
    this.moveCooldown = this.config.MOVE_DELAY;

    if (tile === TILE_TYPES.TREASURE) {
      this.grid[ny][nx] = TILE_TYPES.FLOOR;
      this.treasureCount++;
      if (this.treasureCount >= this.totalTreasures) {
        this._gameWon = true;
        this.winTimer = 0;
      }
    }

    if (tile === TILE_TYPES.WATER) this.waterCooldown = 1;

    return true;
  }

  placeTile(x: number, y: number, tile: TileType): void {
    if (x >= 0 && x < this.config.GRID_WIDTH && y >= 0 && y < this.config.GRID_HEIGHT) {
      this.grid[y][x] = tile;
    }
  }

  selectTile(tile: TileType): void  { this.selectedTile = tile; }
  switchMode(mode: 'editor' | 'play'): void { this.mode = mode; }

  /** Decrements cooldown timers and increments win timer. Called every frame. */
  update(): void {
    if (this.moveCooldown > 0) this.moveCooldown--;
    if (this._gameWon)         this.winTimer++;
  }

  // Getters
  getGrid():            TileType[][]      { return this.grid; }
  getMode():            'editor' | 'play' { return this.mode; }
  getPlayer():          { x: number; y: number } { return this.player; }
  getTreasureProgress(): { current: number; total: number } {
    return { current: this.treasureCount, total: this.totalTreasures };
  }
  isGameWon():          boolean { return this._gameWon; }
  getWinTimer():        number  { return this.winTimer; }
  getSelectedTile():    TileType { return this.selectedTile; }

  /** Persists the current map to localStorage. */
  save(): void {
    localStorage.setItem('a1j_tilemap', JSON.stringify(this.grid));
    console.log('A1J map saved');
  }

  /** Restores the map from localStorage if available. */
  load(): void {
    const data = localStorage.getItem('a1j_tilemap');
    if (data) {
      this.grid = JSON.parse(data) as TileType[][];
      console.log('A1J map loaded');
    }
  }

  /** Downloads the current map as a JSON file. */
  download(): void {
    const json = JSON.stringify(this.grid, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'tilemap.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log('A1J map downloaded');
  }
}

/* ================================================================
   GameView
   ================================================================ */

/**
 * Responsible for rendering the game state each frame.
 * Reads from GameModel; no game-logic side-effects.
 */
class GameView {
  private readonly model:  GameModel;
  private readonly config: IA1JConfig;

  constructor(model: GameModel, config: IA1JConfig) {
    this.model  = model;
    this.config = config;
  }

  /** Main render entry point ??called by GameController.update(). */
  render(): void {
    window.background(40);

    if (this.model.getMode() === 'editor') {
      this.renderEditor();
    } else {
      this.renderPlay();
    }

    this.renderPalette();
    this.renderUI();

    if (this.model.isGameWon()) this.renderWinScreen();
  }

  private renderEditor(): void {
    const grid = this.model.getGrid();
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        this.renderTile(x, y, grid[y][x]);
      }
    }
  }

  private renderPlay(): void {
    const grid = this.model.getGrid();
    for (let y = 0; y < this.config.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.config.GRID_WIDTH; x++) {
        this.renderTile(x, y, grid[y][x]);
      }
    }
    this.renderPlayer();
  }

  private renderTile(x: number, y: number, type: TileType): void {
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
        circle(px + this.config.TILE_SIZE / 2, py + this.config.TILE_SIZE / 2, this.config.TILE_SIZE * 0.5);
        break;
      case TILE_TYPES.SPAWN:
        fill(200, 200, 200);
        rect(px, py, this.config.TILE_SIZE, this.config.TILE_SIZE);
        fill(0, 255, 100);
        noStroke();
        circle(px + this.config.TILE_SIZE / 2, py + this.config.TILE_SIZE / 2, this.config.TILE_SIZE * 0.3);
        break;
    }

    pop();
  }

  private renderPlayer(): void {
    const p  = this.model.getPlayer();
    const px = p.x * this.config.TILE_SIZE + this.config.TILE_SIZE / 2;
    const py = p.y * this.config.TILE_SIZE + this.config.TILE_SIZE / 2;

    window.push();
    window.fill(255, 100, 200);
    window.noStroke();
    window.circle(px, py, this.config.TILE_SIZE * 0.7);
    window.pop();
  }

  private renderPalette(): void {
    const py = this.config.GRID_HEIGHT * this.config.TILE_SIZE;

    window.push();
    window.fill(30, 30, 40);
    window.noStroke();
    window.rect(0, py, width, this.config.PALETTE_HEIGHT);
    window.pop();

    const options: Array<{ type: TileType; name: string; color: [number, number, number] }> = [
      { type: TILE_TYPES.FLOOR,  name: 'Floor', color: [200, 200, 200] },
      { type: TILE_TYPES.WALL,   name: 'Wall',  color: [50,  50,  50 ] },
      { type: TILE_TYPES.WATER,  name: 'Water', color: [50,  100, 200] },
      { type: TILE_TYPES.SPAWN,  name: 'Spawn', color: [0,   255, 100] },
    ];

    options.forEach((opt, i): void => {
      const x = 20 + i * 140;
      const y = py + 20;
      const w = 120;
      const h = 50;

      push();
      if (this.model.getMode() === 'editor' && this.model.getSelectedTile() === opt.type) {
        strokeWeight(3); stroke(255, 255, 0);
      } else {
        strokeWeight(1); stroke(100);
      }
      fill(...opt.color);
      rect(x, y, w, h);
      fill(255); noStroke();
      textAlign(window.CENTER, window.CENTER);
      textSize(12);
      text(opt.name, x + w / 2, y + h / 2);
      pop();
    });
  }

  private renderUI(): void {
    const py = this.config.GRID_HEIGHT * this.config.TILE_SIZE;

    window.push();
    window.fill(255); window.noStroke();
    window.textAlign(window.LEFT, window.TOP);
    window.textSize(14);

    if (this.model.getMode() === 'editor') {
      text('EDITOR MODE | P: Play | S: Save | L: Load | D: Download', 10, py + 5);
    } else {
      const prog = this.model.getTreasureProgress();
      text(`PLAY MODE | WASD: Move | Treasures: ${prog.current}/${prog.total}`, 10, py + 5);
    }
    pop();
  }

  private renderWinScreen(): void {
    window.push();
    window.fill(0, 0, 0, 200);
    window.noStroke();
    window.rect(0, 0, width, this.config.GRID_HEIGHT * this.config.TILE_SIZE);

    window.fill(255, 220, 0);
    window.textAlign(window.CENTER, window.CENTER);
    window.textSize(48);
    window.text('YOU WIN!', width / 2, (this.config.GRID_HEIGHT * this.config.TILE_SIZE) / 2);

    textSize(24); fill(255);
    text('Returning to editor...', width / 2, (this.config.GRID_HEIGHT * this.config.TILE_SIZE) / 2 + 60);
    pop();
  }
}

/* ================================================================
   GameController
   ================================================================ */

/**
 * Orchestrates user input and coordinates Model and View.
 * Bridges p5.js events with game logic.
 */
class GameController {
  private readonly model:  GameModel;
  private readonly view:   GameView;
  private readonly config: IA1JConfig;

  constructor(model: GameModel, view: GameView, config: IA1JConfig) {
    this.model  = model;
    this.view   = view;
    this.config = config;
  }

  /** Called once per frame: advance state then render. */
  update(): void {
    this.model.update();
    this.view.render();
  }

  handleKeyPressed(k: string): void {
    if (k === 'p' || k === 'P') {
      if (this.model.getMode() === 'editor') this.model.resetForPlay();
      return;
    }

    if (this.model.getMode() === 'editor') {
      if (k === 's' || k === 'S') this.model.save();
      if (k === 'l' || k === 'L') this.model.load();
      if (k === 'd' || k === 'D') this.model.download();
      return;
    }

    if (this.model.getMode() === 'play' && !this.model.isGameWon()) {
      if (k === 'w' || k === 'W') this.model.movePlayer( 0, -1);
      if (k === 's' || k === 'S') this.model.movePlayer( 0,  1);
      if (k === 'a' || k === 'A') this.model.movePlayer(-1,  0);
      if (k === 'd' || k === 'D') this.model.movePlayer( 1,  0);
    }
  }

  handleMousePressed(mx: number, my: number): void {
    if (this.model.getMode() !== 'editor') return;

    const gameGridH = this.config.GRID_HEIGHT * this.config.TILE_SIZE;
    const paletteY  = gameGridH;

    if (my < gameGridH) {
      const gx = Math.floor(mx / this.config.TILE_SIZE);
      const gy = Math.floor(my / this.config.TILE_SIZE);
      this.model.placeTile(gx, gy, this.model.getSelectedTile());
      return;
    }

    if (my > paletteY && my < paletteY + this.config.PALETTE_HEIGHT) {
      const tileOptions: TileType[] = [
        TILE_TYPES.FLOOR, TILE_TYPES.WALL, TILE_TYPES.WATER, TILE_TYPES.SPAWN,
      ];
      tileOptions.forEach((type, i): void => {
        const x = 20 + i * 140;
        const y = paletteY + 20;
        if (mx > x && mx < x + 120 && my > y && my < y + 50) {
          this.model.selectTile(type);
        }
      });
    }
  }

  handleMouseDrag(mx: number, my: number): void {
    if (this.model.getMode() !== 'editor') return;
    const gameGridH = this.config.GRID_HEIGHT * this.config.TILE_SIZE;
    if (my < gameGridH) {
      this.model.placeTile(
        Math.floor(mx / this.config.TILE_SIZE),
        Math.floor(my / this.config.TILE_SIZE),
        this.model.getSelectedTile()
      );
    }
  }
}

/* ================================================================
   p5.js sketch integration
   ================================================================ */

let a1j_gameModel:      GameModel      | null = null;
let a1j_gameView:       GameView       | null = null;
let a1j_gameController: GameController | null = null;

function setupA1J(): void {
  window.resizeCanvas(
    A1J_CONFIG.GRID_WIDTH  * A1J_CONFIG.TILE_SIZE,
    A1J_CONFIG.GRID_HEIGHT * A1J_CONFIG.TILE_SIZE + A1J_CONFIG.PALETTE_HEIGHT
  );

  a1j_gameModel      = new GameModel(A1J_CONFIG);
  a1j_gameView       = new GameView(a1j_gameModel, A1J_CONFIG);
  a1j_gameController = new GameController(a1j_gameModel, a1j_gameView, A1J_CONFIG);
}

function drawA1J(): void {
  if (!a1j_gameController || !a1j_gameModel) return;

  a1j_gameController.update();

  // Auto-return to editor after win animation ends
  if (a1j_gameModel.isGameWon() && a1j_gameModel.getWinTimer() > A1J_CONFIG.WIN_TIMER_MAX) {
    a1j_gameModel.switchMode('editor');
  }

  // Continuous drag painting in editor
  if (window.mouseIsPressed) {
    a1j_gameController.handleMouseDrag(window.mouseX, window.mouseY);
  }
}

function keyPressedA1J(): void {
  a1j_gameController?.handleKeyPressed(window.key);
}

function mousePressedA1J(): void {
  a1j_gameController?.handleMousePressed(window.mouseX, window.mouseY);
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1j',
  'A1J - Dungeon Tile Painter',
  setupA1J,
  drawA1J,
  {
    keyPressed:   keyPressedA1J,
    mousePressed: mousePressedA1J,
    description:  'Paint dungeon tiles and play through your creation. Editor: click to paint, P to play. Play: WASD to move, collect all treasures.',
    canvasSize:   {
      width:  A1J_CONFIG.GRID_WIDTH  * A1J_CONFIG.TILE_SIZE,
      height: A1J_CONFIG.GRID_HEIGHT * A1J_CONFIG.TILE_SIZE + A1J_CONFIG.PALETTE_HEIGHT,
    },
  }
);

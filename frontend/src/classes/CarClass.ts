/**
 * Car — Animated Vehicle Class
 *
 * A p5.js drawable car that bounces between screen edges and responds
 * to arrow-key input. Used in A1D and any project that needs a moving vehicle.
 *
 * All drawing calls use the p5 globals injected by ProjectManager.exposeP5Globals().
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
export class Car {
  /** Car manufacturer name. */
  make:      string;
  /** Car model name. */
  model:     string;
  /** Manufacturing year. */
  year:      number;
  /** Pixels per frame movement speed. */
  speed:     number;
  /** Current X position (left edge of car body). */
  x:         number;
  /** Current Y position (top edge of car body). */
  y:         number;
  /** Width of the car body in pixels. */
  width:     number;
  /** Height of the car body in pixels. */
  height:    number;
  /** Body fill colour as a p5.Color. */
  color:     p5.Color;
  /** Current movement direction: 1 = right, -1 = left. */
  direction: number;

  constructor(
    make:  string,
    model: string,
    year:  number,
    speed: number,
    x     = 100,
    y     = 200
  ) {
    this.make      = make;
    this.model     = model;
    this.year      = year;
    this.speed     = speed;
    this.x         = x;
    this.y         = y;
    this.width     = 80;
    this.height    = 40;
    this.color     = window.color(window.random(255), window.random(255), window.random(255));
    this.direction = 1;
  }

  /* ================================================================
     Rendering
     ================================================================ */

  /** Draws the car at its current position using p5 primitives. */
  display(): void {
    push();
    translate(this.x, this.y);

    // Body
    fill(this.color);
    stroke(0);
    strokeWeight(2);
    rect(0, 0, this.width, this.height, 5);

    // Roof — slightly darker shade of body colour
    fill(
      window.red(this.color)   * 0.8,
      window.green(this.color) * 0.8,
      window.blue(this.color)  * 0.8
    );
    rect(15, -15, this.width - 30, 15, 3);

    // Tyres
    fill(50);
    circle(15,              this.height + 5, 15);
    circle(this.width - 15, this.height + 5, 15);

    // Wheel rims
    fill(200);
    circle(15,              this.height + 5, 8);
    circle(this.width - 15, this.height + 5, 8);

    // Windows
    fill(150, 200, 255, 150);
    rect(20,                  -12, 15, 10);
    rect(this.width - 35,     -12, 15, 10);

    // Headlight (faces the direction of travel)
    fill(255, 255, 200);
    if (this.direction > 0) {
      circle(this.width - 5, 10, 8);
    } else {
      circle(5, 10, 8);
    }

    pop();
  }

  /* ================================================================
     Movement
     ================================================================ */

  /**
   * Advances the car by `speed` pixels in the current direction.
   * Reverses direction when the car reaches the canvas edge.
   */
  move(): void {
    this.x += this.speed * this.direction;

    if (this.x > width - this.width || this.x < 0) {
      this.direction *= -1;
    }

    this.x = constrain(this.x, 0, width - this.width);
  }

  /**
   * Reads arrow-key state and moves the car accordingly.
   * Called when the project wants player-controlled movement.
   */
  handleInput(): void {
    if (keyIsDown(window.LEFT_ARROW)) {
      this.x        -= this.speed;
      this.direction = -1;
    }
    if (keyIsDown(window.RIGHT_ARROW)) {
      this.x        += this.speed;
      this.direction = 1;
    }
    if (keyIsDown(window.UP_ARROW))   this.y -= this.speed;
    if (keyIsDown(window.DOWN_ARROW)) this.y += this.speed;

    this.x = constrain(this.x, 0, width  - this.width);
    this.y = constrain(this.y, 0, height - this.height);
  }

  /** Convenience method — move then display (called once per frame). */
  update(): void {
    this.move();
    this.display();
  }

  /* ================================================================
     Setters
     ================================================================ */

  /** @param newSpeed - Pixels per frame */
  setSpeed(newSpeed: number): void { this.speed = newSpeed; }

  setPosition(x: number, y: number): void { this.x = x; this.y = y; }

  setColor(r: number, g: number, b: number): void {
    this.color = window.color(r, g, b);
  }

  /* ================================================================
     Queries
     ================================================================ */

  /** Returns a formatted string describing the car. */
  getInfo(): string {
    return `${this.year} ${this.make} ${this.model} - Speed: ${this.speed}`;
  }

  /**
   * AABB collision detection against another car.
   *
   * @param other - The other Car instance to test against
   * @returns true when the bounding boxes overlap
   */
  checkCollision(other: Car): boolean {
    return (
      this.x < other.x + other.width  &&
      this.x + this.width  > other.x  &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}

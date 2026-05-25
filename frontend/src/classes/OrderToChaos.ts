/**
 * OrderChaosComposition — Entropy-driven Particle System
 *
 * Renders 120 particles that interpolate between a perfectly ordered grid
 * (entropy = 0) and fully random wandering motion (entropy = 1).
 * Mouse X position maps to the entropy value in real time.
 *
 * Uses the native Canvas 2D API — no p5.js dependency.
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */

/* ================================================================
   Interfaces
   ================================================================ */

interface IParticle {
  id:       number;
  orderX:   number;
  orderY:   number;
  chaosX:   number;
  chaosY:   number;
  x:        number;
  y:        number;
  vx:       number;
  vy:       number;
  size:     number;
  baseSize: number;
  color:    { h: number; s: number; l: number };
  phase:    number;
  speed:    number;
}

/* ================================================================
   Class
   ================================================================ */

export class OrderChaosComposition {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx:    CanvasRenderingContext2D;

  /** Current entropy level (0 = perfect order, 1 = full chaos). */
  private entropy:       number;
  /** Target entropy set by mouse position; actual value lerps toward this. */
  private targetEntropy: number;

  private particles:    IParticle[];
  private numParticles: number;

  private mouseX: number;
  private mouseY: number;

  /** Horizontal mid-point of the canvas. Recalculated on resize. */
  private centerX: number;
  /** Vertical mid-point of the canvas. Recalculated on resize. */
  private centerY: number;

  constructor() {
    const el = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (!el) throw new Error('OrderChaosComposition: #canvas element not found');

    this.canvas        = el;
    const ctx          = el.getContext('2d');
    if (!ctx) throw new Error('OrderChaosComposition: could not get 2D context');
    this.ctx           = ctx;

    this.entropy        = 0.5;
    this.targetEntropy  = 0.5;
    this.particles      = [];
    this.numParticles   = 120;
    this.mouseX         = 0;
    this.mouseY         = 0;
    this.centerX        = 0;
    this.centerY        = 0;

    this.setupCanvas();
    this.createParticles();
    this.setupEventListeners();
    this.animate();
  }

  /* ================================================================
     Setup
     ================================================================ */

  private setupCanvas(): void {
    this.resizeCanvas();
    window.addEventListener('resize', (): void => { this.resizeCanvas(); });
  }

  private resizeCanvas(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX       = this.canvas.width  / 2;
    this.centerY       = this.canvas.height / 2;
  }

  private createParticles(): void {
    this.particles  = [];
    const gridSize  = Math.sqrt(this.numParticles);
    const spacing   = Math.min(this.canvas.width, this.canvas.height) / (gridSize + 1);

    for (let i = 0; i < this.numParticles; i++) {
      const gridX = i % gridSize;
      const gridY = Math.floor(i / gridSize);

      const p: IParticle = {
        id:       i,
        orderX:   this.centerX + (gridX - gridSize / 2) * spacing * 0.8,
        orderY:   this.centerY + (gridY - gridSize / 2) * spacing * 0.8,
        chaosX:   Math.random() * this.canvas.width,
        chaosY:   Math.random() * this.canvas.height,
        x:        0,
        y:        0,
        vx:       (Math.random() - 0.5) * 4,
        vy:       (Math.random() - 0.5) * 4,
        size:     3 + Math.random() * 4,
        baseSize: 3 + Math.random() * 4,
        color: {
          h: (i / this.numParticles) * 360 + Math.random() * 60,
          s: 60 + Math.random() * 40,
          l: 50 + Math.random() * 30,
        },
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      };

      p.x = this.lerp(p.orderX, p.chaosX, this.entropy);
      p.y = this.lerp(p.orderY, p.chaosY, this.entropy);

      this.particles.push(p);
    }
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousemove', (e: MouseEvent): void => {
      this.mouseX        = e.clientX;
      this.mouseY        = e.clientY;
      this.targetEntropy = this.clamp(
        this.map(this.mouseX, 0, this.canvas.width, 0, 1),
        0, 1
      );
      this.updateEntropyDisplay();
    });
  }

  /* ================================================================
     DOM update
     ================================================================ */

  private updateEntropyDisplay(): void {
    const pct = Math.round(this.targetEntropy * 100);
    const val = document.getElementById('entropyValue');
    const dot = document.getElementById('entropyDot') as HTMLElement | null;

    if (val) val.textContent = `${pct}%`;
    if (dot) dot.style.left  = `${this.targetEntropy * 288}px`;
  }

  /* ================================================================
     Animation
     ================================================================ */

  private animate(): void {
    this.drawBackground();
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();

    requestAnimationFrame((): void => { this.animate(); });
  }

  private updateParticles(): void {
    this.entropy = this.lerp(this.entropy, this.targetEntropy, 0.05);

    this.particles.forEach((p): void => {
      // Wandering chaos motion
      p.chaosX += p.vx + Math.sin(p.phase) * 0.5;
      p.chaosY += p.vy + Math.cos(p.phase) * 0.5;
      p.phase  += p.speed;

      if (Math.random() < 0.02) {
        p.vx += (Math.random() - 0.5) * 0.5;
        p.vy += (Math.random() - 0.5) * 0.5;
      }

      // Wrap at canvas edges
      if (p.chaosX < 0)                  p.chaosX = this.canvas.width;
      if (p.chaosX > this.canvas.width)  p.chaosX = 0;
      if (p.chaosY < 0)                  p.chaosY = this.canvas.height;
      if (p.chaosY > this.canvas.height) p.chaosY = 0;

      // Velocity damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Blend toward current entropy
      p.x    = this.lerp(p.orderX, p.chaosX, this.entropy);
      p.y    = this.lerp(p.orderY, p.chaosY, this.entropy);
      p.size = p.baseSize + Math.sin(p.phase * 2) * (this.entropy * 3);

      p.color.s = this.lerp(80, 100, this.entropy);
      p.color.l = this.lerp(60, 40 + Math.sin(p.phase) * 20, this.entropy);
    });
  }

  private drawBackground(): void {
    const grad = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2
    );

    /* Lerp from deep navy (order) to deep red (chaos) */
    const orderR = 5,  orderG = 15, orderB = 35;
    const chaosR = 25, chaosG = 5,  chaosB = 5;
    const r = Math.round(this.lerp(orderR, chaosR, this.entropy));
    const g = Math.round(this.lerp(orderG, chaosG, this.entropy));
    const b = Math.round(this.lerp(orderB, chaosB, this.entropy));

    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    grad.addColorStop(1, `rgba(0, 0, 0, 1)`);

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawConnections(): void {
    const connectionRadius = this.lerp(150, 50, this.entropy);
    const maxConnections   = Math.floor(this.lerp(3, 1, this.entropy));
    const alpha            = this.lerp(0.3, 0.05, this.entropy);

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.lineWidth   = 1;

    for (let i = 0; i < this.particles.length; i++) {
      const p1  = this.particles[i];
      let count = 0;

      for (let j = i + 1; j < this.particles.length && count < maxConnections; j++) {
        const p2   = this.particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        if (dist < connectionRadius) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
          count++;
        }
      }
    }
  }

  private drawParticles(): void {
    this.particles.forEach((p): void => {
      const { h, s, l } = p.color;
      const alpha       = this.lerp(0.8, 0.6, this.entropy);
      const glowSize    = p.size * (1 + this.entropy * 2);

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      grad.addColorStop(0,   `hsla(${h}, ${s}%, ${l}%, ${alpha})`);
      grad.addColorStop(0.7, `hsla(${h}, ${s}%, ${l}%, ${alpha * 0.3})`);
      grad.addColorStop(1,   `hsla(${h}, ${s}%, ${l}%, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Core dot
      this.ctx.fillStyle = `hsl(${h}, ${s}%, ${l + 20}%)`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /* ================================================================
     Math helpers
     ================================================================ */

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  private clamp(value: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, value));
  }
}

/* ================================================================
   Auto-initialise when the DOM is ready (standalone page usage)
   ================================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', (): void => {
    if (document.getElementById('canvas')) {
      new OrderChaosComposition();
    }
  });
} else if (document.getElementById('canvas')) {
  new OrderChaosComposition();
}

/**
 * ProjectManager — Project Switching System
 *
 * Central manager for all interactive media projects. Owns the p5.js instance
 * lifecycle: creation, global-function exposure, per-project setup/draw routing,
 * and teardown when switching between projects.
 *
 * ARCHITECTURE NOTE:
 * p5.js is loaded via CDN in global mode (not imported). ProjectManager uses
 * instance mode (new p5(sketch, container)) to isolate each project. After
 * creating the instance it calls exposeP5Globals() so project files (A1A–A1J)
 * can call p5 drawing functions without referencing `p.` on every line.
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
import type { IProject, IProjectOptions, ICanvasSize } from '../types/project';

/* ================================================================
   Type alias for a p5 instance.
   p5 is a CDN global; InstanceType<typeof p5> resolves via p5.d.ts.
   ================================================================ */
type P5Instance = InstanceType<typeof p5>;

/* Cast window to a permissive type for property injection.
   We need to write many p5 helpers onto window, and TypeScript's
   strict lib.dom.d.ts marks most of them as readonly.            */
type GlobalWindow = Window & typeof globalThis & Record<string, unknown>;

export class ProjectManager {
  /* ----------------------------------------------------------------
     State
     ---------------------------------------------------------------- */

  /** Registered projects keyed by their id string (e.g. "A1A"). */
  private projects: Map<string, IProject>;

  /** The project currently rendered on-screen. */
  private currentProject: IProject | null;

  /** Reference to the p5 canvas element (kept for potential future use). */
  private canvas: p5.Element | null;

  /** True while the draw loop is active. */
  private isRunning: boolean;

  /** The live p5 instance; replaced each time a new project starts. */
  private p5Instance: P5Instance | null;

  /** True after exposeP5Globals() has been called at least once. */
  private p5Ready: boolean;

  /**
   * Timeout ID for the small setup delay that prevents race conditions
   * between p5 instance creation and the project's own setup function.
   */
  private setupTimeoutId: ReturnType<typeof setTimeout> | null;

  constructor() {
    this.projects         = new Map<string, IProject>();
    this.currentProject   = null;
    this.canvas           = null;
    this.isRunning        = false;
    this.p5Instance       = null;
    this.p5Ready          = false;
    this.setupTimeoutId   = null;
  }

  /* ================================================================
     Public API
     ================================================================ */

  /**
   * Registers a new project with the manager.
   *
   * Projects must be registered before they can be switched to.
   * Each A1x.ts file calls this at load time, passing its own
   * setup/draw functions.
   *
   * @param id          - Unique short identifier, e.g. "A1A"
   * @param name        - Human-readable name shown in the sidebar
   * @param setupFn     - Called once when the project becomes active
   * @param drawFn      - Called every frame while the project is active
   * @param options     - Optional handlers and metadata
   * @returns true on success, false on validation failure
   *
   * @example
   * projectManager.registerProject('A1A', 'A1A - Basic Shapes', setupA1A, drawA1A, {
   *   description: 'Demonstrates p5.js primitive drawing functions.',
   *   canvasSize: { width: 400, height: 400 },
   * });
   */
  registerProject(
    id: string,
    name: string,
    setupFn: () => void,
    drawFn: () => void,
    options: IProjectOptions = {}
  ): boolean {
    /* Validate inputs before mutating state */
    if (!id || typeof id !== 'string') {
      console.error('Invalid project ID:', id);
      return false;
    }
    if (!name || typeof name !== 'string') {
      console.error('Invalid project name:', name);
      return false;
    }
    if (typeof setupFn !== 'function' || typeof drawFn !== 'function') {
      console.error('setup and draw must be functions');
      return false;
    }
    if (typeof p5 === 'undefined') {
      console.error('p5.js library not loaded — cannot register project');
      return false;
    }

    /* Resolve and clamp canvas size */
    const raw: Partial<ICanvasSize> = options.canvasSize ?? {};
    const canvasSize: ICanvasSize = {
      width:  (raw.width  != null && raw.width  >= 1) ? raw.width  : 400,
      height: (raw.height != null && raw.height >= 1) ? raw.height : 400,
    };
    if (!options.canvasSize || options.canvasSize.width < 1 || options.canvasSize.height < 1) {
      console.warn('Invalid canvas size supplied; using 400×400 defaults');
    }

    const project: IProject = {
      id,
      name,
      setup:         setupFn,
      draw:          drawFn,
      mousePressed:  options.mousePressed  ?? ((): void => { /* no-op */ }),
      keyPressed:    options.keyPressed    ?? ((): void => { /* no-op */ }),
      windowResized: options.windowResized ?? ((): void => { /* no-op */ }),
      cleanup:       options.cleanup ?? null,
      description:   options.description ?? 'Interactive project',
      canvasSize,
    };

    this.projects.set(id, project);
    console.log(`Project registered: ${name} (${id})`);
    return true;
  }

  /**
   * Switches the active project.
   *
   * Lifecycle on switch:
   * 1. Run cleanup() on the outgoing project (if provided)
   * 2. Destroy the current p5 instance
   * 3. Create a fresh p5 instance for the incoming project
   * 4. Refresh the project-info panel
   *
   * @param projectId - ID of the project to activate
   * @returns true if the switch succeeded, false otherwise
   */
  switchToProject(projectId: string): boolean {
    if (!projectId || typeof projectId !== 'string') {
      console.error(`Invalid project ID: ${projectId}`);
      return false;
    }
    if (!this.projects.has(projectId)) {
      console.error(`Project not found: ${projectId}`);
      return false;
    }

    /* Teardown previous project */
    if (this.currentProject?.cleanup) {
      console.log(`Cleaning up previous project: ${this.currentProject.name}`);
      try {
        this.currentProject.cleanup();
      } catch (err) {
        // Log but continue — a failing cleanup should not block the new project
        console.error('Error during project cleanup:', err);
      }
    }

    /* Cancel any pending setup timeouts to avoid stale initialisation */
    if (this.setupTimeoutId !== null) {
      clearTimeout(this.setupTimeoutId);
      this.setupTimeoutId = null;
    }

    this.cleanupP5Instance();
    this.isRunning    = false;
    this.currentProject = this.projects.get(projectId) ?? null;

    this.setupCanvas();
    this.updateProjectInfo();

    console.log(`Switched to project: ${this.currentProject?.name ?? projectId}`);
    return true;
  }

  /** Returns all registered projects as an array. */
  getAllProjects(): IProject[] {
    return Array.from(this.projects.values());
  }

  /** Returns the currently active project, or null. */
  getCurrentProject(): IProject | null {
    return this.currentProject;
  }

  /** Returns true if a project with the given id is registered. */
  hasProject(projectId: string): boolean {
    return this.projects.has(projectId);
  }

  /** Returns the total count of registered projects. */
  getProjectCount(): number {
    return this.projects.size;
  }

  /* ================================================================
     Private helpers
     ================================================================ */

  /**
   * Exposes p5 drawing functions and state onto window so that project
   * files (A1A–A1J) can call them as bare globals (background(), fill()…)
   * rather than needing a reference to the p5 instance.
   *
   * State properties (mouseX, width, …) are installed as getter/setter
   * pairs so that p5's own internal writes are accepted (no-op setter)
   * while reads always reflect the live p5 instance value.
   *
   * @param p - The freshly created p5 instance to expose
   */
  private exposeP5Globals(p: P5Instance): void {
    try {
      const win = window as GlobalWindow;
      // Use a plain record reference for bulk function assignments.
      // TypeScript would reject each overloaded p5 function against the
      // specific Window interface signatures; bypassing that here is safe
      // because the runtime behaviour is correct — p5 manages its own types.
      const w: Record<string, unknown> = win;

      /* Store instance reference for advanced project use */
      win['currentP5'] = p;

      /* ---- Read-proxied state properties ---- */
      const stateProps: string[] = [
        'mouseX', 'mouseY', 'pmouseX', 'pmouseY',
        'width', 'height', 'frameCount',
        'key', 'keyCode', 'mouseIsPressed',
      ];
      for (const prop of stateProps) {
        Object.defineProperty(window, prop, {
          get: () => (p as unknown as Record<string, unknown>)[prop],
          // p5 needs to write these internally; we accept the write silently
          set: (_val: unknown): void => { /* no-op — p5 manages on instance */ },
          configurable: true,
          enumerable:   true,
        });
      }

      /* ---- Drawing functions ---- */
      w['background']   = p.background.bind(p);
      w['fill']         = p.fill.bind(p);
      w['noFill']       = p.noFill.bind(p);
      w['stroke']       = p.stroke.bind(p);
      w['noStroke']     = p.noStroke.bind(p);
      w['strokeWeight'] = p.strokeWeight.bind(p);

      /* ---- Colour utilities ---- */
      w['color']        = p.color.bind(p);
      w['red']          = p.red.bind(p);
      w['green']        = p.green.bind(p);
      w['blue']         = p.blue.bind(p);
      w['hue']          = p.hue.bind(p);
      w['saturation']   = p.saturation.bind(p);
      w['brightness']   = p.brightness.bind(p);
      w['alpha']        = p.alpha.bind(p);
      w['lerpColor']    = p.lerpColor.bind(p);
      w['colorMode']    = p.colorMode.bind(p);

      /* ---- Shapes ---- */
      w['circle']       = p.circle.bind(p);
      w['ellipse']      = p.ellipse.bind(p);
      w['rect']         = p.rect.bind(p);
      w['square']       = p.square.bind(p);
      w['line']         = p.line.bind(p);
      w['point']        = p.point.bind(p);
      w['triangle']     = p.triangle.bind(p);

      /* ---- Transforms ---- */
      w['push']         = p.push.bind(p);
      w['pop']          = p.pop.bind(p);
      w['translate']    = p.translate.bind(p);
      w['rotate']       = p.rotate.bind(p);
      w['scale']        = p.scale.bind(p);
      w['resetMatrix']  = p.resetMatrix.bind(p);

      /* ---- Math ---- */
      w['PI']        = p.PI;
      w['TWO_PI']    = p.TWO_PI;
      w['HALF_PI']   = p.HALF_PI;
      w['random']    = p.random.bind(p);
      w['map']       = p.map.bind(p);
      w['constrain'] = p.constrain.bind(p);
      w['dist']      = p.dist.bind(p);
      w['lerp']      = p.lerp.bind(p);
      w['sin']       = p.sin.bind(p);
      w['cos']       = p.cos.bind(p);
      w['tan']       = p.tan.bind(p);
      w['atan2']     = p.atan2.bind(p);
      w['floor']     = p.floor.bind(p);
      w['ceil']      = p.ceil.bind(p);
      w['round']     = p.round.bind(p);
      w['abs']       = p.abs.bind(p);
      w['sqrt']      = p.sqrt.bind(p);
      w['pow']       = p.pow.bind(p);
      w['min']       = p.min.bind(p);
      w['max']       = p.max.bind(p);
      w['int']       = p.int.bind(p);
      w['norm']      = p.norm.bind(p);
      w['noise']     = p.noise.bind(p);
      w['noiseSeed'] = p.noiseSeed.bind(p);
      w['radians']   = p.radians.bind(p);
      w['degrees']   = p.degrees.bind(p);
      w['keyIsDown'] = p.keyIsDown.bind(p);

      /* ---- Text ---- */
      w['text']      = p.text.bind(p);
      w['textAlign'] = p.textAlign.bind(p);
      w['textSize']  = p.textSize.bind(p);
      w['textStyle'] = p.textStyle.bind(p);
      w['textWidth'] = p.textWidth.bind(p);

      /* ---- Loop control ---- */
      w['noLoop']    = p.noLoop.bind(p);
      w['loop']      = p.loop.bind(p);
      w['redraw']    = p.redraw.bind(p);

      /* ---- Constants ---- */
      w['NORMAL']    = p.NORMAL;
      w['ITALIC']    = p.ITALIC;
      w['BOLD']      = p.BOLD;
      w['LEFT']      = p.LEFT;
      w['RIGHT']     = p.RIGHT;
      w['CENTER']    = p.CENTER;
      w['TOP']       = p.TOP;
      w['BOTTOM']    = p.BOTTOM;
      w['BASELINE']  = p.BASELINE;
      w['RGB']       = p.RGB;
      w['HSB']       = p.HSB;
      w['VIDEO']     = p.VIDEO;
      w['AUDIO']     = p.AUDIO;
      w['CLOSE']     = p.CLOSE;
      w['LEFT_ARROW']  = p.LEFT_ARROW;
      w['RIGHT_ARROW'] = p.RIGHT_ARROW;
      w['UP_ARROW']    = p.UP_ARROW;
      w['DOWN_ARROW']  = p.DOWN_ARROW;
      w['ENTER']       = p.ENTER;
      w['RETURN']      = p.RETURN;
      w['ESCAPE']      = p.ESCAPE;
      w['BACKSPACE']   = p.BACKSPACE;
      w['SHIFT']       = p.SHIFT;
      w['CONTROL']     = p.CONTROL;
      w['ALT']         = p.ALT;

      /* ---- DOM / image helpers ---- */
      w['createGraphics'] = p.createGraphics.bind(p);
      w['createButton']   = p.createButton.bind(p);
      w['createSlider']   = p.createSlider.bind(p);
      w['createInput']    = p.createInput.bind(p);
      w['createCapture']  = p.createCapture.bind(p);
      w['loadImage']      = p.loadImage.bind(p);
      w['image']          = p.image.bind(p);
      w['saveCanvas']     = p.saveCanvas.bind(p);

      console.log('p5.js functions exposed globally');
    } catch (err) {
      console.error('Error exposing p5.js functions:', err);
    }
  }

  /**
   * Creates a new p5 instance and wires up the project's event handlers.
   *
   * A 10 ms timeout before calling the project's own setup() ensures that
   * exposeP5Globals() has finished writing to window before any project code
   * tries to call those functions. Without this delay, the first few lines
   * of a setup() could run before window.background etc. are defined.
   */
  private setupCanvas(): void {
    if (!this.currentProject) {
      console.error('No current project to set up canvas for');
      return;
    }

    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (!canvasWrapper) {
      console.error('canvas-wrapper element not found in DOM');
      return;
    }

    const { width, height } = this.currentProject.canvasSize;
    if (!width || !height || width < 1 || height < 1) {
      console.error('Invalid canvas dimensions:', { width, height });
      return;
    }

    /* Ensure the previous instance is fully gone before creating a new one */
    this.cleanupP5Instance();
    canvasWrapper.innerHTML = '';

    /* Capture reference for closures below */
    const self = this;

    const sketch = (p: P5Instance): void => {
      /** Called once by p5 when the canvas is first created. */
      p.setup = (): void => {
        try {
          self.canvas = p.createCanvas(width, height);
          self.exposeP5Globals(p);

          /*
           * Small delay ensures window.background etc. are set before the
           * project's own setup() runs. Without this, fast-loading projects
           * can call p5 globals before exposeP5Globals() completes.
           */
          self.setupTimeoutId = setTimeout((): void => {
            try {
              if (self.currentProject) {
                self.currentProject.setup();
              }
              self.isRunning    = true;
              self.setupTimeoutId = null;
              console.log(`Canvas ready: ${self.currentProject?.name} ${width}x${height}`);
            } catch (err) {
              console.error(`Error in project setup (${self.currentProject?.name}):`, err);
              self.isRunning = false;
            }
          }, 10);
        } catch (err) {
          console.error('Error in p5 setup:', err);
          self.isRunning = false;
        }
      };

      /** Called every frame (~60 fps) while the project is running. */
      p.draw = (): void => {
        if (!self.isRunning || !self.currentProject) return;
        try {
          /*
           * Re-expose globals if they were lost (e.g. after a hot-reload).
           * Checking one sentinel function is cheaper than re-exposing every frame.
           */
          if (typeof (window as GlobalWindow)['background'] !== 'function') {
            self.exposeP5Globals(p);
          }
          self.currentProject.draw();
        } catch (err) {
          console.error('Error in draw loop:', err);
          self.isRunning = false;
          p.noLoop();
        }
      };

      p.mousePressed = (): void => {
        if (!self.currentProject) return;
        try {
          self.exposeP5Globals(p); // Refresh mouse state globals
          self.currentProject.mousePressed();
        } catch (err) {
          console.error('Error in mousePressed handler:', err);
        }
      };

      p.keyPressed = (): void => {
        if (!self.currentProject) return;
        try {
          self.exposeP5Globals(p); // Refresh key state globals
          self.currentProject.keyPressed();
        } catch (err) {
          console.error('Error in keyPressed handler:', err);
        }
      };

      p.windowResized = (): void => {
        if (!self.currentProject) return;
        try {
          self.currentProject.windowResized(p);
        } catch (err) {
          console.error('Error in windowResized handler:', err);
        }
      };
    };

    try {
      this.p5Instance = new p5(sketch, canvasWrapper);
      this.p5Ready    = true;
    } catch (err) {
      console.error('Failed to create p5 instance:', err);
      this.p5Ready   = false;
      this.isRunning = false;
    }
  }

  /**
   * Destroys the live p5 instance and resets related state.
   * Safe to call even if no instance exists.
   */
  private cleanupP5Instance(): void {
    if (this.p5Instance) {
      try {
        this.p5Instance.noLoop?.();
        this.p5Instance.remove();
      } catch (err) {
        console.error('Error cleaning up p5 instance:', err);
      } finally {
        this.p5Instance = null;
        this.canvas     = null;
        this.p5Ready    = false;
      }
    }
  }

  /**
   * Refreshes the #project-info panel with the current project's metadata.
   * HTML is sanitised via escapeHtml() before insertion to prevent XSS.
   */
  private updateProjectInfo(): void {
    const el = document.getElementById('project-info');
    if (el && this.currentProject) {
      const name        = this.escapeHtml(this.currentProject.name);
      const description = this.escapeHtml(this.currentProject.description);
      const { width, height } = this.currentProject.canvasSize;

      el.innerHTML = `
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="project-meta">
          <small>Canvas size: ${width} × ${height}</small>
        </div>
      `;
    }
  }

  /**
   * Escapes HTML special characters to prevent XSS when inserting
   * project names/descriptions into innerHTML.
   */
  private escapeHtml(text: string): string {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/* ================================================================
   Global singleton
   Assign to window so that project files (A1A–A1J) loaded as
   plain <script> tags can call window.projectManager.registerProject()
   ================================================================ */
export const projectManager = new ProjectManager();
(window as GlobalWindow)['projectManager'] = projectManager;

/**
 * Core domain types for the project management system.
 *
 * These interfaces describe the data flowing through ProjectManager,
 * UIController, and each project sketch file (A1A–A1J).
 */

/** Canvas pixel dimensions for a project. */
export interface ICanvasSize {
  width: number;
  height: number;
}

/**
 * Full configuration for a registered p5.js project.
 * Produced by ProjectManager.registerProject() and read
 * throughout the UI and API layers.
 */
export interface IProject {
  /** Short identifier, e.g. "A1A". Must be unique across all projects. */
  id: string;
  /** Human-readable display name shown in the sidebar button. */
  name: string;
  /** One-sentence description shown in the project info panel. */
  description: string;
  /** Canvas dimensions requested by the project at registration time. */
  canvasSize: ICanvasSize;
  /** Called once when the project is activated — runs p5 setup logic. */
  setup: () => void;
  /** Called every frame while the project is active — runs p5 draw logic. */
  draw: () => void;
  /** Forwarded to p5's mousePressed event. */
  mousePressed: () => void;
  /** Forwarded to p5's keyPressed event. */
  keyPressed: () => void;
  /**
   * Forwarded to p5's windowResized event.
   * Receives the p5 instance so the project can resize its canvas if needed.
   */
  windowResized: (p?: InstanceType<typeof p5>) => void;
  /**
   * Optional teardown — called before switching to another project.
   * Use to stop audio, cancel timers, or remove p5 DOM elements.
   */
  cleanup: (() => void) | null;
  /** View count populated from the backend API when available. */
  views?: number;
  /** Like count populated from the backend API when available. */
  likes?: number;
  /** Classification tags used for filtering (populated from API). */
  tags?: string[];
}

/**
 * Options passed to ProjectManager.registerProject().
 * All fields are optional; ProjectManager fills in sensible defaults.
 */
export interface IProjectOptions {
  mousePressed?: () => void;
  keyPressed?: () => void;
  windowResized?: (p?: InstanceType<typeof p5>) => void;
  cleanup?: () => void;
  description?: string;
  canvasSize?: ICanvasSize;
}

/** Snapshot of the ProjectManager's runtime state. */
export interface IProjectState {
  /** The currently active project, or null if none is selected. */
  currentProject: IProject | null;
  /** True while a p5 instance is running. */
  isRunning: boolean;
  /** True after exposeP5Globals() has been called at least once. */
  p5Ready: boolean;
  /** Total number of registered projects. */
  projectCount: number;
}

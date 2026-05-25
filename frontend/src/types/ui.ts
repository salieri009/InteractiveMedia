/**
 * Types for UI components and interaction state.
 * Used by UIController and UXEnhancements.
 */

/** Semantic category for a toast notification. */
export type NotificationType = 'success' | 'warning' | 'error' | 'info';

/** Semantic category for the status-bar indicator. */
export type StatusType = 'info' | 'success' | 'warning' | 'error';

/** Data needed to display a toast notification. */
export interface INotification {
  type: NotificationType;
  message: string;
  /**
   * Optional recovery suggestion shown below the main message.
   * Used for Heuristic 9 (help users recognise, diagnose, recover from errors).
   */
  recovery?: string;
  /** How long the toast stays visible in milliseconds. Defaults to 4000. */
  durationMs?: number;
}

/** Configuration for a dynamically created control-panel button. */
export interface IButtonConfig {
  id: string;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
}

/** One entry in the help panel keyboard shortcuts list. */
export interface IHelpItem {
  /** Keyboard shortcut label, e.g. "H" or "1–9". */
  shortcut?: string;
  description: string;
}

/** One record in the UXEnhancements navigation history stack. */
export interface IHistoryEntry {
  /** Project id at the time of navigation. */
  projectId: string;
  /** Unix timestamp (ms) of when the project was activated. */
  timestamp: number;
}

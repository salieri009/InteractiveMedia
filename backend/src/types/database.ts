/**
 * Database type definitions for the Interactive Media backend.
 *
 * Shared between the DynamoDB (production) and in-memory (development) layers.
 * Both `DatabaseUtils` and `DatabaseManager` are typed against these interfaces.
 *
 * @module types/database
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */

/* ================================================================
   Base Record
   ================================================================ */

/**
 * Fields that every persisted record must carry.
 * DynamoDB items include these via `created` / `updatedAt` conventions.
 */
export interface IDatabaseRecord {
  /** Primary key — e.g. "a1a", "a1b". */
  id: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
}

/* ================================================================
   Project
   ================================================================ */

/**
 * A persisted project record stored in DynamoDB (or in-memory).
 * Extends `IDatabaseRecord` with project-specific fields.
 */
export interface IProjectRecord extends IDatabaseRecord {
  /** Human-readable project name, e.g. "A1A - Basic Shapes". */
  name: string;
  /** Short description shown in the analytics panel. */
  description: string;
  /** Author display name. */
  author: string;
  /** Lowercase taxonomy tags used for filtering. */
  tags: string[];
  /** Total page-view counter. Incremented on every `getProject` call. */
  views: number;
  /** User-generated like counter. Incremented via the `/like` route. */
  likes: number;
  /**
   * ISO-8601 creation timestamp stored as `created` in DynamoDB
   * (legacy field name — kept for backward compat; `createdAt` is the canonical name).
   */
  created?: string;
}

/**
 * Partial project data accepted when creating a new record.
 * `views` and `likes` are set to 0 by the database layer.
 */
export type IProjectInput = Pick<IProjectRecord, 'id' | 'name' | 'description' | 'author' | 'tags'>;

/* ================================================================
   Analytics
   ================================================================ */

/** Summary row for a single project inside the analytics response. */
export interface IProjectSummary {
  id:    string;
  name:  string;
  views: number;
  likes: number;
}

/**
 * Global analytics record stored as a single DynamoDB item (key: `id = "global"`).
 * Additional computed fields are merged in by `getAnalytics()`.
 */
export interface IAnalyticsRecord {
  /** Always `"global"` for the single global record. */
  id: string;
  /** Total view events across all projects. */
  totalViews: number;
  /** Total number of registered projects. */
  totalProjects: number;
  /** Per-day event count keyed by ISO date string ("YYYY-MM-DD"). */
  dailyStats: Record<string, number>;
  /** ISO-8601 record creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt?: string;
  /** Top 5 projects ranked by view count (computed at query time). */
  topProjects?: IProjectSummary[];
  /** Per-tag project count (computed at query time). */
  tagStats?: Record<string, number>;
  /** Mean views per project (computed at query time). */
  averageViews?: number;
}

/* ================================================================
   Query Filters
   ================================================================ */

/**
 * Optional filters passed to `getAllProjects()`.
 * All filters are applied as AND conditions (if both provided).
 */
export interface IQueryFilters {
  /** Filter by exact lowercase tag string. */
  tag?:    string;
  /** Full-text search applied to name, description, and tags. */
  search?: string;
}

/* ================================================================
   Operation Results
   ================================================================ */

/**
 * Generic wrapper returned by every DatabaseUtils static method.
 * Callers should check `success` before accessing `data`.
 *
 * @template T - The shape of the payload on success.
 */
export interface IDatabaseResult<T> {
  /** `true` when the operation completed without errors. */
  success: boolean;
  /** Populated on success. */
  data?:   T;
  /** Total item count (only set by list operations). */
  total?:  number;
  /** Human-readable error message; populated on failure. */
  error?:  string;
}

/* ================================================================
   Health Check
   ================================================================ */

/** Returned by `DatabaseUtils.healthCheck()`. */
export interface IHealthCheckResult {
  success:  boolean;
  message?: string;
  /** `"dynamodb"` in production, `"in-memory"` in development. */
  type?:    'dynamodb' | 'in-memory';
  error?:   string;
}

/* ================================================================
   In-Memory Storage Shape
   ================================================================ */

/**
 * Internal storage shape used by `DatabaseUtils._inMemoryStorage`.
 * Not exported for external consumption.
 */
export interface IInMemoryStorage {
  projects:  IProjectRecord[];
  analytics: Pick<IAnalyticsRecord, 'id' | 'totalViews' | 'totalProjects'>;
}

/* ================================================================
   AnalyticsManager Event
   ================================================================ */

/** A single analytics event stored by `AnalyticsManager`. */
export interface IAnalyticsEvent {
  event:     string;
  data:      Record<string, unknown>;
  timestamp: string;
  sessionId: string;
  userAgent: string;
}

/** Aggregated output from `AnalyticsManager.getAnalytics()`. */
export interface IAnalyticsSummary {
  totalEvents:    number;
  uniqueSessions: number;
  eventTypes:     Record<string, number>;
  dailyStats:     Record<string, number>;
  topPages:       Record<string, number>;
}

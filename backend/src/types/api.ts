/**
 * API-layer type definitions for the Interactive Media backend.
 *
 * These interfaces describe the JSON shapes going in and out of the Express
 * routes — distinct from the raw database records in `types/database.ts`.
 *
 * @module types/api
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */

import type { IProjectSummary, IAnalyticsRecord } from './database';

/* ================================================================
   Generic Response Envelope
   ================================================================ */

/**
 * Standard envelope wrapping every API response body.
 *
 * @template T - The shape of the `data` payload on success.
 */
export interface IApiResponse<T = unknown> {
  /** `true` when the request completed successfully. */
  success:    boolean;
  /** Payload, present on success. */
  data?:      T;
  /** Total count for list endpoints. */
  total?:     number;
  /** ISO-8601 response timestamp. */
  timestamp?: string;
  /** Human-readable error description, present on failure. */
  error?:     string;
  /** Extended error detail (only in development mode). */
  message?:   string;
}

/* ================================================================
   Health Check
   ================================================================ */

/** Payload returned by `GET /api/health`. */
export interface IHealthResponse {
  /** `"OK"` or `"ERROR"`. */
  status:      'OK' | 'ERROR';
  timestamp:   string;
  /** Server uptime in seconds. */
  uptime:      number;
  environment: string;
  /** Database health sub-object. */
  database?: {
    success:  boolean;
    message?: string;
    type?:    'dynamodb' | 'in-memory';
    error?:   string;
  };
}

/* ================================================================
   Project Payloads
   ================================================================ */

/**
 * API-visible project shape — a superset of what the database returns.
 * The `created` legacy field is preserved for backward compatibility.
 */
export interface IApiProject {
  id:          string;
  name:        string;
  description: string;
  author:      string;
  tags:        string[];
  views:       number;
  likes:       number;
  /** ISO-8601 creation timestamp (legacy field stored in DynamoDB as `created`). */
  created?:    string;
  createdAt?:  string;
  updatedAt?:  string;
}

/**
 * Request body for `POST /api/projects`.
 * `views` and `likes` are always ignored from the client.
 */
export interface ICreateProjectRequest {
  /** Project identifier — must be globally unique. */
  id:           string;
  name:         string;
  description:  string;
  /** Defaults to `"Anonymous"` if omitted. */
  author?:      string;
  /** Defaults to `[]` if omitted. */
  tags?:        string[];
}

/* ================================================================
   Analytics Payload
   ================================================================ */

/**
 * Analytics payload returned by `GET /api/analytics`.
 * Extends the raw `IAnalyticsRecord` with all computed fields guaranteed present.
 */
export interface IApiAnalytics extends IAnalyticsRecord {
  topProjects:  IProjectSummary[];
  tagStats:     Record<string, number>;
  averageViews: number;
}

/* ================================================================
   Request Helpers
   ================================================================ */

/**
 * Query parameters accepted by `GET /api/projects`.
 * Extends Express's default `ParsedQs` with our known keys.
 */
export interface IProjectsQuery {
  tag?:    string;
  search?: string;
}

/** Path parameters for project-level routes. */
export interface IProjectParams {
  id: string;
}

/* ================================================================
   Error Response
   ================================================================ */

/** Shape of all non-2xx responses. */
export interface IErrorResponse {
  success: false;
  error:   string;
  /** Route path — included in 404 responses. */
  path?:   string;
  /** HTTP method — included in 404 responses. */
  method?: string;
  /** Verbose detail — only included in development mode. */
  message?: string;
}

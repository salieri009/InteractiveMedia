/**
 * Types for all API request/response shapes.
 * Mirrors the JSON produced by backend/src/api/index.ts.
 */

/**
 * Generic API envelope used for every success/error response.
 * T is the type of the `data` field; defaults to unknown when unspecified.
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  /** Total record count for paginated list responses. */
  total?: number;
}

/** Project record as returned by GET /api/projects/:id or the list endpoint. */
export interface IApiProject {
  id: string;
  name: string;
  description: string;
  author: string;
  tags: string[];
  views: number;
  likes: number;
  created: string;
}

/** Analytics payload returned by GET /api/analytics. */
export interface IAnalytics {
  id: string;
  totalViews: number;
  totalProjects: number;
  averageViews: number;
  topProjects: Array<{
    id: string;
    name: string;
    views: number;
    likes: number;
  }>;
  /** Tag name → count of projects with that tag. */
  tagStats: Record<string, number>;
  /** ISO date string → view count for that day. */
  dailyStats: Record<string, number>;
  updatedAt?: string;
}

/** Health check response from GET /api/health. */
export interface IHealthCheck {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    success: boolean;
    message?: string;
    /** Which database implementation is active. */
    type?: 'dynamodb' | 'in-memory';
    error?: string;
  };
}

/** Query parameters accepted by GET /api/projects. */
export interface IProjectFilters {
  tag?: string;
  search?: string;
}

/**
 * Local fallback data used when the backend API is unreachable.
 * Keeps the UI functional in offline or demo conditions.
 * Optional fields prevent a type error when the API is not available
 * — callers cast to the full type after confirming connectivity.
 */
export interface IFallbackData {
  /** Minimal project stubs — no server-side stats needed offline. */
  projects: Array<Pick<IApiProject, 'id' | 'name' | 'description'>>;
  /** Approximate global stats available without a live database. */
  analytics: Pick<IAnalytics, 'totalViews' | 'totalProjects' | 'averageViews'>;
}

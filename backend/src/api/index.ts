/**
 * Interactive Media Backend — Serverless Express API
 *
 * Five REST endpoints:
 *   GET  /api/health             — liveness + database status
 *   GET  /api/projects           — list all projects (tag / search filters)
 *   GET  /api/projects/:id       — single project (increments views)
 *   POST /api/projects           — create a project record
 *   POST /api/projects/:id/like  — increment like counter
 *   GET  /api/analytics          — global statistics
 *
 * Database layer is selected at import time:
 *   - production  → `utils/database-aws`  (DynamoDB)
 *   - development → `utils/database`      (in-memory)
 *
 * The compiled module exports both `app` (for local dev) and
 * `handler` (for AWS Lambda / Vercel serverless).
 *
 * @module api/index
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */

import express, {
  Application,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors        from 'cors';
import helmet      from 'helmet';
import compression from 'compression';
import rateLimit   from 'express-rate-limit';
import morgan      from 'morgan';
import serverless  from 'serverless-http';
import 'dotenv/config';

import type {
  IApiResponse,
  IHealthResponse,
  IApiProject,
  IApiAnalytics,
  ICreateProjectRequest,
  IProjectsQuery,
  IProjectParams,
  IErrorResponse,
} from '../types/api';

/* ================================================================
   Database Selection
   ================================================================ */

// Dynamic require is intentional — the production path must NOT be
// bundled into the development build and vice-versa.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DatabaseUtils: typeof import('../utils/database').DatabaseUtils =
  process.env.NODE_ENV === 'production'
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ? require('../utils/database-aws').DatabaseUtils
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require('../utils/database').DatabaseUtils;

/* ================================================================
   Express Application
   ================================================================ */

const app: Application = express();
const PORT             = Number(process.env.PORT) || 3001;

/* ================================================================
   Middleware
   ================================================================ */

// Security headers — allow CDN script sources used by the frontend
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc:    ["'self'", 'https:'],
        objectSrc:  ["'none'"],
        mediaSrc:   ["'self'"],
        frameSrc:   ["'none'"],
      },
    },
  })
);

// CORS — restrict origins in production, allow local dev hosts
app.use(
  cors({
    origin:         process.env.NODE_ENV === 'production'
      ? [
          'https://your-domain.vercel.app',
          'https://your-domain.netlify.app',
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — 100 requests per IP per 15-minute window
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      100,
    message:  { error: 'Too many requests from this IP, please try again later.' },
  })
);

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ================================================================
   Database Initialization (development only)
   ================================================================ */

if (process.env.NODE_ENV !== 'production') {
  DatabaseUtils.initializeDatabase().catch(console.error);
}

/* ================================================================
   Routes
   ================================================================ */

/**
 * GET /api/health
 * Returns server uptime and database connectivity status.
 */
app.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const dbHealth = await DatabaseUtils.healthCheck();

    const body: IHealthResponse = {
      status:      'OK',
      timestamp:   new Date().toISOString(),
      uptime:      process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      database:    dbHealth,
    };

    res.json(body);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      status:    'ERROR',
      timestamp: new Date().toISOString(),
      error:     msg,
    } satisfies Partial<IHealthResponse> & { error: string });
  }
});

/**
 * GET /api/projects
 * Returns all projects. Supports `?tag=` and `?search=` query params.
 */
app.get(
  '/api/projects',
  async (req: Request<Record<string, never>, unknown, unknown, IProjectsQuery>, res: Response): Promise<void> => {
    try {
      const { tag, search } = req.query;
      const result = await DatabaseUtils.getAllProjects({ tag, search });

      if (result.success) {
        const body: IApiResponse<IApiProject[]> = {
          success:   true,
          data:      result.data as IApiProject[],
          total:     result.total,
          timestamp: new Date().toISOString(),
        };
        res.json(body);
      } else {
        res.status(500).json({ success: false, error: result.error ?? 'Unknown error' } satisfies IErrorResponse);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        error:   'Failed to fetch projects',
        message: process.env.NODE_ENV === 'development' ? msg : undefined,
      } satisfies IErrorResponse);
    }
  }
);

/**
 * GET /api/projects/:id
 * Returns a single project and increments its view count.
 */
app.get(
  '/api/projects/:id',
  async (req: Request<IProjectParams>, res: Response): Promise<void> => {
    try {
      const { id }  = req.params;
      const result  = await DatabaseUtils.getProject(id);

      if (result.success) {
        const body: IApiResponse<IApiProject> = {
          success:   true,
          data:      result.data as IApiProject,
          timestamp: new Date().toISOString(),
        };
        res.json(body);
      } else {
        const code = result.error === 'Project not found' ? 404 : 500;
        res.status(code).json({ success: false, error: result.error ?? 'Unknown error' } satisfies IErrorResponse);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        error:   'Failed to fetch project',
        message: process.env.NODE_ENV === 'development' ? msg : undefined,
      } satisfies IErrorResponse);
    }
  }
);

/**
 * POST /api/projects
 * Creates a new project record.
 * Requires `id`, `name`, and `description` in the request body.
 */
app.post(
  '/api/projects',
  async (req: Request<Record<string, never>, unknown, ICreateProjectRequest>, res: Response): Promise<void> => {
    try {
      const { id, name, description, author, tags = [] } = req.body;

      if (!id || !name || !description) {
        res.status(400).json({
          success: false,
          error:   'Missing required fields: id, name, description',
        } satisfies IErrorResponse);
        return;
      }

      const result = await DatabaseUtils.createProject({
        id,
        name,
        description,
        author: author ?? 'Anonymous',
        tags:   Array.isArray(tags) ? tags : [],
      });

      if (result.success) {
        const body: IApiResponse<IApiProject> & { message: string } = {
          success: true,
          data:    result.data as IApiProject,
          message: 'Project created successfully',
        };
        res.status(201).json(body);
      } else {
        const code = result.error?.includes('already exists') ? 409 : 500;
        res.status(code).json({ success: false, error: result.error ?? 'Unknown error' } satisfies IErrorResponse);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        error:   'Failed to create project',
        message: process.env.NODE_ENV === 'development' ? msg : undefined,
      } satisfies IErrorResponse);
    }
  }
);

/**
 * POST /api/projects/:id/like
 * Increments the like counter for a project.
 */
app.post(
  '/api/projects/:id/like',
  async (req: Request<IProjectParams>, res: Response): Promise<void> => {
    try {
      const { id }  = req.params;
      const result  = await DatabaseUtils.incrementLikes(id);

      if (result.success) {
        const body: IApiResponse<{ likes: number }> & { message: string } = {
          success: true,
          data:    result.data,
          message: 'Project liked successfully',
        };
        res.json(body);
      } else {
        res.status(500).json({ success: false, error: result.error ?? 'Unknown error' } satisfies IErrorResponse);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        error:   'Failed to like project',
        message: process.env.NODE_ENV === 'development' ? msg : undefined,
      } satisfies IErrorResponse);
    }
  }
);

/**
 * GET /api/analytics
 * Returns global statistics enriched with per-project summaries.
 */
app.get('/api/analytics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await DatabaseUtils.getAnalytics();

    if (result.success) {
      const body: IApiResponse<IApiAnalytics> = {
        success:   true,
        data:      result.data as IApiAnalytics,
        timestamp: new Date().toISOString(),
      };
      res.json(body);
    } else {
      res.status(500).json({ success: false, error: result.error ?? 'Unknown error' } satisfies IErrorResponse);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      error:   'Failed to fetch analytics',
      message: process.env.NODE_ENV === 'development' ? msg : undefined,
    } satisfies IErrorResponse);
  }
});

/* ================================================================
   Error Handling
   ================================================================ */

// 404 — no route matched
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error:   'Endpoint not found',
    path:    req.path,
    method:  req.method,
  } satisfies IErrorResponse);
});

// Global error handler — must have four parameters for Express to recognise it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    error:   'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  } satisfies IErrorResponse);
});

/* ================================================================
   Server Start (development)
   ================================================================ */

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, (): void => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
}

/* ================================================================
   Exports
   ================================================================ */

export default app;

/** AWS Lambda / Vercel serverless handler. */
export const handler = serverless(app);

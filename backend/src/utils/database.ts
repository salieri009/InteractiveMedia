/**
 * Database Utilities — Multi-Environment Support
 *
 * All database operations with automatic fallback:
 *   - Production (AWS_REGION + PROJECTS_TABLE env vars set): AWS DynamoDB
 *   - Development / test: in-memory Map-based store
 *
 * The module-level `dynamodb` variable is `null` when running in
 * development; every static method checks this before attempting a
 * DynamoDB call and falls through to the in-memory path.
 *
 * @module utils/database
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */

import AWS from 'aws-sdk';

import type {
  IProjectRecord,
  IProjectInput,
  IAnalyticsRecord,
  IQueryFilters,
  IDatabaseResult,
  IHealthCheckResult,
  IInMemoryStorage,
  IAnalyticsEvent,
  IAnalyticsSummary,
  IProjectSummary,
} from '../types/database';

/* ================================================================
   Environment Detection
   ================================================================ */

/** True only when all required AWS env vars are present. */
const isProduction: boolean =
  process.env.NODE_ENV === 'production' &&
  Boolean(process.env.AWS_REGION)       &&
  Boolean(process.env.PROJECTS_TABLE);

const PROJECTS_TABLE  = process.env.PROJECTS_TABLE  ?? 'interactive-media-projects';
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE ?? 'interactive-media-analytics';

/* ================================================================
   DynamoDB Client (production only)
   ================================================================ */

let dynamodb: AWS.DynamoDB.DocumentClient | null = null;

if (isProduction) {
  try {
    dynamodb = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
    });
    console.log('Using AWS DynamoDB for database');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Failed to initialise DynamoDB, falling back to in-memory:', msg);
  }
} else {
  console.log('Using in-memory database for development');
}

/* ================================================================
   DatabaseUtils
   ================================================================ */

/**
 * Static utility class exposing all database operations.
 *
 * Each method returns `IDatabaseResult<T>` — callers must check
 * `result.success` before consuming `result.data`.
 */
export class DatabaseUtils {
  /**
   * In-memory store used when DynamoDB is not available.
   * Initialised lazily on first access.
   *
   * Typed explicitly so `strict: true` does not complain about the
   * static class field being inferred as `null`.
   */
  private static _inMemoryStorage: IInMemoryStorage | null = null;

  /* ================================================================
     Project Operations
     ================================================================ */

  /**
   * Returns all projects, optionally filtered by tag or search term.
   *
   * @param filters - Optional `tag` and/or `search` constraints.
   */
  static async getAllProjects(
    filters: IQueryFilters = {}
  ): Promise<IDatabaseResult<IProjectRecord[]>> {
    try {
      if (!dynamodb || !isProduction) {
        return DatabaseUtils._getAllProjectsInMemory(filters);
      }

      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: PROJECTS_TABLE,
      };

      const result = await dynamodb.scan(params).promise();
      let projects: IProjectRecord[] = (result.Items as IProjectRecord[]) ?? [];

      if (filters.tag) {
        const tag = filters.tag.toLowerCase();
        projects = projects.filter(p => p.tags?.includes(tag));
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        projects = projects.filter(
          p =>
            p.name.toLowerCase().includes(q)        ||
            p.description.toLowerCase().includes(q) ||
            p.tags?.some(t => t.includes(q))
        );
      }

      return { success: true, data: projects, total: projects.length };
    } catch (err: unknown) {
      console.error('Error getting projects:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Fetches a single project by ID and increments its view counter.
   *
   * @param id - Project identifier.
   */
  static async getProject(id: string): Promise<IDatabaseResult<IProjectRecord>> {
    try {
      if (!dynamodb || !isProduction) {
        return DatabaseUtils._getProjectInMemory(id);
      }

      const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
        TableName: PROJECTS_TABLE,
        Key: { id },
      };

      const result = await dynamodb.get(params).promise();

      if (!result.Item) {
        return { success: false, error: 'Project not found' };
      }

      await DatabaseUtils.incrementViews(id);

      return { success: true, data: result.Item as IProjectRecord };
    } catch (err: unknown) {
      console.error('Error getting project:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Persists a new project record.
   * Uses a DynamoDB `ConditionExpression` to prevent duplicate IDs.
   *
   * @param projectData - Required fields for the new project.
   */
  static async createProject(
    projectData: IProjectInput
  ): Promise<IDatabaseResult<IProjectRecord>> {
    try {
      if (!dynamodb || !isProduction) {
        return DatabaseUtils._createProjectInMemory(projectData);
      }

      const project: IProjectRecord = {
        ...projectData,
        created:   new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views:     0,
        likes:     0,
        tags:      Array.isArray(projectData.tags)
          ? projectData.tags.map(t => t.toLowerCase())
          : [],
      };

      const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName:           PROJECTS_TABLE,
        Item:                project,
        ConditionExpression: 'attribute_not_exists(id)',
      };

      await dynamodb.put(params).promise();
      await DatabaseUtils.updateAnalytics('totalProjects', 1);

      return { success: true, data: project };
    } catch (err: unknown) {
      // aws-sdk v2 errors carry a `code` property
      const awsErr = err as { code?: string; message?: string };
      if (awsErr.code === 'ConditionalCheckFailedException') {
        return { success: false, error: 'Project with this ID already exists' };
      }
      console.error('Error creating project:', err);
      return { success: false, error: awsErr.message ?? String(err) };
    }
  }

  /**
   * Increments the view counter for a project and updates global analytics.
   *
   * @param id - Project identifier.
   */
  static async incrementViews(id: string): Promise<IDatabaseResult<void>> {
    try {
      if (!dynamodb || !isProduction) {
        return DatabaseUtils._incrementFieldInMemory(id, 'views');
      }

      const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName:                 PROJECTS_TABLE,
        Key:                       { id },
        UpdateExpression:          'ADD #views :inc',
        ExpressionAttributeNames:  { '#views': 'views' },
        ExpressionAttributeValues: { ':inc': 1 },
      };

      await dynamodb.update(params).promise();
      await DatabaseUtils.updateAnalytics('totalViews', 1);

      return { success: true };
    } catch (err: unknown) {
      console.error('Error incrementing views:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Increments the like counter for a project.
   *
   * @param id - Project identifier.
   * @returns The updated `likes` count.
   */
  static async incrementLikes(
    id: string
  ): Promise<IDatabaseResult<{ likes: number }>> {
    try {
      if (!dynamodb || !isProduction) {
        return DatabaseUtils._incrementLikesInMemory(id);
      }

      const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName:                 PROJECTS_TABLE,
        Key:                       { id },
        UpdateExpression:          'ADD likes :inc',
        ExpressionAttributeValues: { ':inc': 1 },
        ReturnValues:              'ALL_NEW',
      };

      const result = await dynamodb.update(params).promise();
      const attrs  = result.Attributes as { likes: number } | undefined;

      return { success: true, data: { likes: attrs?.likes ?? 0 } };
    } catch (err: unknown) {
      console.error('Error incrementing likes:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Returns the global analytics record enriched with project statistics.
   */
  static async getAnalytics(): Promise<IDatabaseResult<IAnalyticsRecord>> {
    try {
      if (!dynamodb || !isProduction) {
        return DatabaseUtils._getAnalyticsInMemory();
      }

      const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
        TableName: ANALYTICS_TABLE,
        Key:       { id: 'global' },
      };

      const result = await dynamodb.get(params).promise();

      let analytics: IAnalyticsRecord = (result.Item as IAnalyticsRecord) ?? {
        id:            'global',
        totalViews:    0,
        totalProjects: 0,
        dailyStats:    {},
        createdAt:     new Date().toISOString(),
      };

      // Enrich with live project stats
      const projectsResult = await DatabaseUtils.getAllProjects();
      if (projectsResult.success && projectsResult.data) {
        const projects = projectsResult.data;

        const topProjects: IProjectSummary[] = [...projects]
          .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
          .slice(0, 5)
          .map(p => ({ id: p.id, name: p.name, views: p.views ?? 0, likes: p.likes ?? 0 }));

        const tagStats: Record<string, number> = {};
        projects.forEach(p => {
          p.tags?.forEach(tag => { tagStats[tag] = (tagStats[tag] ?? 0) + 1; });
        });

        const totalViews = projects.reduce((s, p) => s + (p.views ?? 0), 0);

        analytics = {
          ...analytics,
          totalProjects: projects.length,
          topProjects,
          tagStats,
          averageViews:  projects.length > 0 ? totalViews / projects.length : 0,
        };
      }

      return { success: true, data: analytics };
    } catch (err: unknown) {
      console.error('Error getting analytics:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Atomically increments a numeric field in the global analytics record.
   *
   * @param field     - DynamoDB attribute name to increment.
   * @param increment - Numeric value to add (typically 1).
   */
  static async updateAnalytics(
    field: string,
    increment: number
  ): Promise<IDatabaseResult<void>> {
    try {
      if (!dynamodb || !isProduction) return { success: true };

      const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName:                 ANALYTICS_TABLE,
        Key:                       { id: 'global' },
        UpdateExpression:          'ADD #field :inc SET #updated = :updated',
        ExpressionAttributeNames:  { '#field': field, '#updated': 'updatedAt' },
        ExpressionAttributeValues: { ':inc': increment, ':updated': new Date().toISOString() },
      };

      await dynamodb.update(params).promise();
      return { success: true };
    } catch (err: unknown) {
      console.error('Error updating analytics:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Seeds the database with default project records if it is empty.
   * No-ops when projects already exist.
   */
  static async initializeDatabase(): Promise<IDatabaseResult<void>> {
    try {
      const existing = await DatabaseUtils.getAllProjects();
      if (existing.success && (existing.data?.length ?? 0) > 0) {
        console.log('Database already initialised');
        return { success: true };
      }

      const defaults: IProjectInput[] = [
        {
          id:          'a1a',
          name:        'A1A - Basic Shapes',
          description: 'Fundamental shapes drawing with p5.js.',
          author:      'UTS Student',
          tags:        ['basic', 'shapes', 'beginner'],
        },
        {
          id:          'a1b',
          name:        'A1B - Interactive Animation',
          description: 'Animated circle with mouse interaction.',
          author:      'UTS Student',
          tags:        ['animation', 'interactive', 'intermediate'],
        },
        {
          id:          'a1c',
          name:        'A1C - Pattern Generator',
          description: 'Interactive pattern generator with multiple modes.',
          author:      'UTS Student',
          tags:        ['patterns', 'interactive', 'advanced'],
        },
      ];

      for (const p of defaults) {
        await DatabaseUtils.createProject(p);
      }

      console.log('Database initialised with default projects');
      return { success: true };
    } catch (err: unknown) {
      console.error('Error initialising database:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Checks whether the database layer is accessible.
   */
  static async healthCheck(): Promise<IHealthCheckResult> {
    try {
      if (!dynamodb || !isProduction) {
        return { success: true, message: 'In-memory database is healthy', type: 'in-memory' };
      }

      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: PROJECTS_TABLE,
        Select:    'COUNT',
      };

      await dynamodb.scan(params).promise();
      return { success: true, message: 'Database connection healthy', type: 'dynamodb' };
    } catch (err: unknown) {
      console.error('Database health check failed:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /* ================================================================
     In-Memory Fallback Helpers (private)
     ================================================================ */

  /**
   * Lazily initialises and returns the in-memory storage singleton.
   */
  private static _getStorage(): IInMemoryStorage {
    if (!DatabaseUtils._inMemoryStorage) {
      DatabaseUtils._inMemoryStorage = {
        projects:  [],
        analytics: { id: 'global', totalViews: 0, totalProjects: 0 },
      };
    }
    return DatabaseUtils._inMemoryStorage;
  }

  private static async _getAllProjectsInMemory(
    filters: IQueryFilters
  ): Promise<IDatabaseResult<IProjectRecord[]>> {
    let projects = [...DatabaseUtils._getStorage().projects];

    if (filters.tag) {
      const tag = filters.tag.toLowerCase();
      projects = projects.filter(p => p.tags?.includes(tag));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(
        p =>
          p.name.toLowerCase().includes(q)        ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some(t => t.includes(q))
      );
    }

    return { success: true, data: projects, total: projects.length };
  }

  private static async _getProjectInMemory(
    id: string
  ): Promise<IDatabaseResult<IProjectRecord>> {
    const store   = DatabaseUtils._getStorage();
    const project = store.projects.find(p => p.id === id);

    if (!project) return { success: false, error: 'Project not found' };

    project.views = (project.views ?? 0) + 1;
    store.analytics.totalViews++;

    return { success: true, data: project };
  }

  private static async _createProjectInMemory(
    input: IProjectInput
  ): Promise<IDatabaseResult<IProjectRecord>> {
    const store = DatabaseUtils._getStorage();

    if (store.projects.some(p => p.id === input.id)) {
      return { success: false, error: 'Project with this ID already exists' };
    }

    const now     = new Date().toISOString();
    const project: IProjectRecord = {
      ...input,
      created:   now,
      createdAt: now,
      updatedAt: now,
      views:     0,
      likes:     0,
      tags:      input.tags.map(t => t.toLowerCase()),
    };

    store.projects.push(project);
    store.analytics.totalProjects++;

    return { success: true, data: project };
  }

  private static async _incrementFieldInMemory(
    id: string,
    field: 'views' | 'likes'
  ): Promise<IDatabaseResult<void>> {
    const project = DatabaseUtils._getStorage().projects.find(p => p.id === id);
    if (!project) return { success: false, error: 'Project not found' };

    (project[field] as number) = ((project[field] as number) ?? 0) + 1;
    return { success: true };
  }

  private static async _incrementLikesInMemory(
    id: string
  ): Promise<IDatabaseResult<{ likes: number }>> {
    const project = DatabaseUtils._getStorage().projects.find(p => p.id === id);
    if (!project) return { success: false, error: 'Project not found' };

    project.likes = (project.likes ?? 0) + 1;
    return { success: true, data: { likes: project.likes } };
  }

  private static async _getAnalyticsInMemory(): Promise<IDatabaseResult<IAnalyticsRecord>> {
    const store    = DatabaseUtils._getStorage();
    const projects = store.projects;

    const topProjects: IProjectSummary[] = [...projects]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 5)
      .map(p => ({ id: p.id, name: p.name, views: p.views ?? 0, likes: p.likes ?? 0 }));

    const tagStats: Record<string, number> = {};
    projects.forEach(p => {
      p.tags?.forEach(tag => { tagStats[tag] = (tagStats[tag] ?? 0) + 1; });
    });

    const totalViews   = projects.reduce((s, p) => s + (p.views ?? 0), 0);
    const averageViews = projects.length > 0 ? totalViews / projects.length : 0;

    const analytics: IAnalyticsRecord = {
      id:            'global',
      totalViews:    store.analytics.totalViews,
      totalProjects: store.analytics.totalProjects,
      dailyStats:    {},
      createdAt:     new Date().toISOString(),
      topProjects,
      tagStats,
      averageViews,
    };

    return { success: true, data: analytics };
  }
}

/* ================================================================
   DatabaseManager — In-Memory Map CRUD
   ================================================================ */

/**
 * Generic key-value store backed by a `Map<string, unknown[]>`.
 *
 * Used for testing and development scenarios where DynamoDB is
 * unavailable. Not used directly by the Express routes — those go
 * through `DatabaseUtils`.
 */
export class DatabaseManager {
  /** Internal storage keyed by collection name. */
  private readonly connection: Map<string, Record<string, unknown>[]>;
  /** Whether `connect()` has been called. */
  private isConnected: boolean;

  constructor() {
    this.connection  = new Map();
    this.isConnected = false;
  }

  /** Opens the in-memory connection. */
  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      this.isConnected = true;
      console.log('Database connected (in-memory)');
      return { success: true };
    } catch (err: unknown) {
      console.error('Database connection failed:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /** Closes the in-memory connection and clears all data. */
  async disconnect(): Promise<void> {
    this.connection.clear();
    this.isConnected = false;
    console.log('Database disconnected');
  }

  /**
   * Inserts a new record into the named collection.
   *
   * @param collection - Collection (table) name.
   * @param data       - Partial record data; `id`, `createdAt`, `updatedAt` are set automatically.
   */
  async create(
    collection: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.isConnected) throw new Error('Database not connected');

    const record: Record<string, unknown> = {
      ...data,
      id:        data['id'] ?? this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const col = this.connection.get(collection) ?? [];
    col.push(record);
    this.connection.set(collection, col);

    return record;
  }

  /**
   * Returns records from a collection optionally filtered by exact field match.
   *
   * @param collection - Collection name.
   * @param query      - Key-value pairs that must all match.
   */
  async read(
    collection: string,
    query: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>[]> {
    if (!this.isConnected) throw new Error('Database not connected');

    const col = this.connection.get(collection) ?? [];
    if (Object.keys(query).length === 0) return col;

    return col.filter(item =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    );
  }

  /**
   * Merges `data` into the record with the given `id`.
   *
   * @throws When the item is not found.
   */
  async update(
    collection: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.isConnected) throw new Error('Database not connected');

    const col   = this.connection.get(collection) ?? [];
    const index = col.findIndex(item => item['id'] === id);

    if (index === -1) throw new Error('Item not found');

    col[index] = { ...col[index], ...data, updatedAt: new Date().toISOString() };
    this.connection.set(collection, col);

    return col[index];
  }

  /**
   * Removes the record with the given `id` from the collection.
   *
   * @throws When the item is not found.
   */
  async delete(
    collection: string,
    id: string
  ): Promise<Record<string, unknown>> {
    if (!this.isConnected) throw new Error('Database not connected');

    const col   = this.connection.get(collection) ?? [];
    const index = col.findIndex(item => item['id'] === id);

    if (index === -1) throw new Error('Item not found');

    const [deleted] = col.splice(index, 1);
    this.connection.set(collection, col);

    return deleted;
  }

  /** Returns `true` when `connect()` has been called successfully. */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /** Generates a URL-safe unique ID. */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

/* ================================================================
   AnalyticsManager — Event Tracking
   ================================================================ */

/**
 * Lightweight analytics event tracker.
 *
 * Events are stored in memory (`this.events`) and optionally
 * persisted to the provided `DatabaseManager` instance when connected.
 */
export class AnalyticsManager {
  private readonly db:     DatabaseManager | null;
  private readonly events: IAnalyticsEvent[];

  /** @param db - Optional `DatabaseManager` instance for persistence. */
  constructor(db: DatabaseManager | null = null) {
    this.db     = db;
    this.events = [];
  }

  /**
   * Records a named analytics event with arbitrary metadata.
   *
   * @param event - Event name, e.g. `"project_view"`.
   * @param data  - Arbitrary key-value metadata.
   */
  async trackEvent(
    event: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    const entry: IAnalyticsEvent = {
      event,
      data,
      timestamp:  new Date().toISOString(),
      sessionId:  this._getSessionId(),
      userAgent:  this._getUserAgent(),
    };

    this.events.push(entry);

    if (this.db?.isHealthy()) {
      await this.db.create('analytics', entry as unknown as Record<string, unknown>);
    }

    console.log('Event tracked:', event, data);
  }

  /**
   * Returns aggregated analytics across all tracked events.
   *
   * @param startDate - ISO-8601 lower bound (inclusive, optional).
   * @param endDate   - ISO-8601 upper bound (inclusive, optional).
   */
  async getAnalytics(
    startDate?: string,
    endDate?:   string
  ): Promise<IAnalyticsSummary> {
    let events: IAnalyticsEvent[] = this.events;

    if (this.db?.isHealthy()) {
      const rows = await this.db.read('analytics');
      events = rows as unknown as IAnalyticsEvent[];
    }

    if (startDate || endDate) {
      const lo = startDate ? new Date(startDate) : null;
      const hi = endDate   ? new Date(endDate)   : null;

      events = events.filter(e => {
        const d = new Date(e.timestamp);
        if (lo && d < lo) return false;
        if (hi && d > hi) return false;
        return true;
      });
    }

    const summary: IAnalyticsSummary = {
      totalEvents:    events.length,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      eventTypes:     {},
      dailyStats:     {},
      topPages:       {},
    };

    events.forEach(e => {
      summary.eventTypes[e.event] = (summary.eventTypes[e.event] ?? 0) + 1;

      const day = e.timestamp.split('T')[0];
      summary.dailyStats[day] = (summary.dailyStats[day] ?? 0) + 1;

      const page = e.data['page'] as string | undefined;
      if (page) summary.topPages[page] = (summary.topPages[page] ?? 0) + 1;
    });

    return summary;
  }

  /* ---- private helpers ---- */

  /**
   * Returns a session identifier — reads from `sessionStorage` in browser
   * environments, falls back to `"server-session"` in Node.
   */
  private _getSessionId(): string {
    // sessionStorage exists only in browser environments.
    // Access via globalThis so the Node.js compiler does not reject it.
    const ss = (globalThis as Record<string, unknown>)['sessionStorage'] as Storage | undefined;
    if (ss) {
      let id = ss.getItem('analytics_session_id');
      if (!id) {
        id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        ss.setItem('analytics_session_id', id);
      }
      return id;
    }
    return 'server-session';
  }

  private _getUserAgent(): string {
    // navigator exists only in browser environments.
    const nav = (globalThis as Record<string, unknown>)['navigator'] as { userAgent?: string } | undefined;
    return nav?.userAgent ?? 'Server';
  }
}

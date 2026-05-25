/**
 * Database Utilities — AWS DynamoDB (Production)
 *
 * This module is imported instead of `database.ts` when
 * `NODE_ENV === 'production'`. It has no in-memory fallback — all
 * operations hit DynamoDB directly.
 *
 * Used by `api/index.ts`:
 * ```ts
 * const DatabaseUtils = process.env.NODE_ENV === 'production'
 *   ? require('./database-aws').DatabaseUtils
 *   : require('./database').DatabaseUtils;
 * ```
 *
 * @module utils/database-aws
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
  IProjectSummary,
} from '../types/database';

/* ================================================================
   DynamoDB Client
   ================================================================ */

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
});

const PROJECTS_TABLE  = process.env.PROJECTS_TABLE  ?? 'interactive-media-projects';
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE ?? 'interactive-media-analytics';

/* ================================================================
   DatabaseUtils (AWS-only)
   ================================================================ */

/**
 * Production-only database utilities backed exclusively by AWS DynamoDB.
 * The static interface mirrors `DatabaseUtils` in `database.ts` so the
 * Express routes can use either module interchangeably.
 */
export class DatabaseUtils {
  /**
   * Returns all projects, optionally filtered by tag or full-text search.
   *
   * @param filters - Optional `tag` and/or `search` constraints.
   */
  static async getAllProjects(
    filters: IQueryFilters = {}
  ): Promise<IDatabaseResult<IProjectRecord[]>> {
    try {
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: PROJECTS_TABLE,
      };

      const result  = await dynamodb.scan(params).promise();
      let projects  = (result.Items as IProjectRecord[]) ?? [];

      if (filters.tag) {
        const tag = filters.tag.toLowerCase();
        projects  = projects.filter(p => p.tags?.includes(tag));
      }

      if (filters.search) {
        const q  = filters.search.toLowerCase();
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
   * @param id - Project primary key.
   */
  static async getProject(id: string): Promise<IDatabaseResult<IProjectRecord>> {
    try {
      const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
        TableName: PROJECTS_TABLE,
        Key:       { id },
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
   * Persists a new project using a conditional put to prevent duplicate IDs.
   *
   * @param projectData - Required project fields.
   */
  static async createProject(
    projectData: IProjectInput
  ): Promise<IDatabaseResult<IProjectRecord>> {
    try {
      const now     = new Date().toISOString();
      const project: IProjectRecord = {
        ...projectData,
        created:   now,
        createdAt: now,
        updatedAt: now,
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
      const awsErr = err as { code?: string; message?: string };
      if (awsErr.code === 'ConditionalCheckFailedException') {
        return { success: false, error: 'Project with this ID already exists' };
      }
      console.error('Error creating project:', err);
      return { success: false, error: awsErr.message ?? String(err) };
    }
  }

  /**
   * Atomically increments the `views` counter for a project.
   *
   * @param id - Project identifier.
   */
  static async incrementViews(id: string): Promise<IDatabaseResult<void>> {
    try {
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
   * Atomically increments the `likes` counter and returns the new value.
   *
   * @param id - Project identifier.
   */
  static async incrementLikes(
    id: string
  ): Promise<IDatabaseResult<{ likes: number }>> {
    try {
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
   * Returns the global analytics record enriched with live project stats.
   */
  static async getAnalytics(): Promise<IDatabaseResult<IAnalyticsRecord>> {
    try {
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
          averageViews: projects.length > 0 ? totalViews / projects.length : 0,
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
   * @param field     - Attribute name to increment.
   * @param increment - Value to add.
   */
  static async updateAnalytics(
    field: string,
    increment: number
  ): Promise<IDatabaseResult<void>> {
    try {
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
   * Seeds the database with default projects when the table is empty.
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
   * Verifies the DynamoDB connection by running a lightweight scan.
   */
  static async healthCheck(): Promise<IHealthCheckResult> {
    try {
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
}

export default DatabaseUtils;

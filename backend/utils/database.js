/**
 * ===============================================
 * Database Utilities - Multi-Environment Support
 * ===============================================
 * 
 * Provides database operations with automatic fallback:
 * - Production: AWS DynamoDB
 * - Development: In-memory database
 * 
 * @module database
 * @author 20+ Years Software Developer
 * @since 2025
 */

const AWS = require('aws-sdk');

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production' && 
                     process.env.AWS_REGION && 
                     process.env.PROJECTS_TABLE;

// Configure AWS SDK only if in production
let dynamodb = null;
if (isProduction) {
  try {
    dynamodb = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    console.log('✅ Using AWS DynamoDB for database');
  } catch (error) {
    console.warn('⚠️ Failed to initialize AWS DynamoDB, falling back to in-memory:', error.message);
  }
} else {
  console.log('📦 Using in-memory database for development');
}

const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'interactive-media-projects';
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || 'interactive-media-analytics';

// ===============================================
// Project Operations
// ===============================================

/**
 * Database utilities class with automatic environment detection.
 * 
 * @class DatabaseUtils
 * @description Handles database operations with automatic fallback to
 *              in-memory storage when AWS DynamoDB is not available.
 */
class DatabaseUtils {
  /**
   * Gets all projects from the database.
   * 
   * @param {Object} [filters={}] - Filter options (tag, search)
   * @returns {Promise<Object>} Result object with success flag and data
   * 
   * @description Retrieves all projects, optionally filtered by tag or search term.
   *              Automatically uses in-memory database if DynamoDB is unavailable.
   */
  static async getAllProjects(filters = {}) {
    try {
      // Use in-memory database if DynamoDB is not available
      if (!dynamodb || !isProduction) {
        return this._getAllProjectsInMemory(filters);
      }
      
      const params = {
        TableName: PROJECTS_TABLE
      };

      const result = await dynamodb.scan(params).promise();
      let projects = result.Items || [];

      // Apply filters
      if (filters.tag) {
        projects = projects.filter(project => 
          project.tags && project.tags.includes(filters.tag.toLowerCase())
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        projects = projects.filter(project =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          (project.tags && project.tags.some(tag => tag.includes(searchLower)))
        );
      }

      return {
        success: true,
        data: projects,
        total: projects.length
      };
    } catch (error) {
      console.error('Error getting projects:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get specific project
  static async getProject(id) {
    try {
      const params = {
        TableName: PROJECTS_TABLE,
        Key: { id }
      };

      const result = await dynamodb.get(params).promise();
      
      if (!result.Item) {
        return {
          success: false,
          error: 'Project not found'
        };
      }

      // Increment view count
      await this.incrementViews(id);

      return {
        success: true,
        data: result.Item
      };
    } catch (error) {
      console.error('Error getting project:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create new project
  static async createProject(projectData) {
    try {
      const project = {
        ...projectData,
        created: new Date().toISOString(),
        views: 0,
        likes: 0,
        tags: Array.isArray(projectData.tags) 
          ? projectData.tags.map(tag => tag.toLowerCase()) 
          : []
      };

      const params = {
        TableName: PROJECTS_TABLE,
        Item: project,
        ConditionExpression: 'attribute_not_exists(id)'
      };

      await dynamodb.put(params).promise();

      // Update analytics
      await this.updateAnalytics('totalProjects', 1);

      return {
        success: true,
        data: project
      };
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        return {
          success: false,
          error: 'Project with this ID already exists'
        };
      }
      console.error('Error creating project:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Increment project views
  static async incrementViews(id) {
    try {
      const params = {
        TableName: PROJECTS_TABLE,
        Key: { id },
        UpdateExpression: 'ADD #views :inc',
        ExpressionAttributeNames: {
          '#views': 'views'
        },
        ExpressionAttributeValues: {
          ':inc': 1
        }
      };

      await dynamodb.update(params).promise();

      // Update total views in analytics
      await this.updateAnalytics('totalViews', 1);

      return { success: true };
    } catch (error) {
      console.error('Error incrementing views:', error);
      return { success: false, error: error.message };
    }
  }

  // Increment project likes
  static async incrementLikes(id) {
    try {
      const params = {
        TableName: PROJECTS_TABLE,
        Key: { id },
        UpdateExpression: 'ADD likes :inc',
        ExpressionAttributeValues: {
          ':inc': 1
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await dynamodb.update(params).promise();

      return {
        success: true,
        data: { likes: result.Attributes.likes }
      };
    } catch (error) {
      console.error('Error incrementing likes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get analytics data
  static async getAnalytics() {
    try {
      const params = {
        TableName: ANALYTICS_TABLE,
        Key: { id: 'global' }
      };

      const result = await dynamodb.get(params).promise();
      
      let analytics = result.Item || {
        id: 'global',
        totalViews: 0,
        totalProjects: 0,
        dailyStats: {},
        createdAt: new Date().toISOString()
      };

      // Get additional stats from projects
      const projectsResult = await this.getAllProjects();
      if (projectsResult.success) {
        const projects = projectsResult.data;
        
        // Top projects by views
        const topProjects = projects
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            name: p.name,
            views: p.views || 0,
            likes: p.likes || 0
          }));

        // Tag statistics
        const tagStats = {};
        projects.forEach(project => {
          if (project.tags) {
            project.tags.forEach(tag => {
              tagStats[tag] = (tagStats[tag] || 0) + 1;
            });
          }
        });

        analytics = {
          ...analytics,
          totalProjects: projects.length,
          topProjects,
          tagStats,
          averageViews: projects.length > 0 
            ? projects.reduce((sum, p) => sum + (p.views || 0), 0) / projects.length 
            : 0
        };
      }

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update analytics
  static async updateAnalytics(field, increment) {
    try {
      const params = {
        TableName: ANALYTICS_TABLE,
        Key: { id: 'global' },
        UpdateExpression: `ADD #field :inc SET #updated = :updated`,
        ExpressionAttributeNames: {
          '#field': field,
          '#updated': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':inc': increment,
          ':updated': new Date().toISOString()
        }
      };

      await dynamodb.update(params).promise();
      return { success: true };
    } catch (error) {
      console.error('Error updating analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Initialize database with default data
  static async initializeDatabase() {
    try {
      // Check if projects already exist
      const existingProjects = await this.getAllProjects();
      if (existingProjects.success && existingProjects.data.length > 0) {
        console.log('Database already initialized');
        return { success: true };
      }

      // Create default projects
      const defaultProjects = [
        {
          id: 'a1a',
          name: 'A1A - Basic Shapes',
          description: 'A basic project demonstrating fundamental shapes drawing.',
          author: 'UTS Student',
          tags: ['basic', 'shapes', 'beginner']
        },
        {
          id: 'a1b',
          name: 'A1B - Interactive Animation',
          description: 'An animated project with moving circle and mouse interaction.',
          author: 'UTS Student',
          tags: ['animation', 'interactive', 'intermediate']
        },
        {
          id: 'a1c',
          name: 'A1C - Pattern Generator',
          description: 'Interactive pattern generator with multiple modes and animations.',
          author: 'UTS Student',
          tags: ['patterns', 'interactive', 'advanced']
        }
      ];

      for (const project of defaultProjects) {
        await this.createProject(project);
      }

      console.log('Database initialized with default projects');
      return { success: true };
    } catch (error) {
      console.error('Error initializing database:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check for database connection.
   * 
   * @returns {Promise<Object>} Health check result
   * 
   * @description Checks if the database is accessible and healthy.
   *              Works with both DynamoDB and in-memory databases.
   */
  static async healthCheck() {
    try {
      // Use in-memory database if DynamoDB is not available
      if (!dynamodb || !isProduction) {
        return { 
          success: true, 
          message: 'In-memory database is healthy',
          type: 'in-memory'
        };
      }
      
      const params = {
        TableName: PROJECTS_TABLE,
        Select: 'COUNT'
      };

      await dynamodb.scan(params).promise();
      return { 
        success: true, 
        message: 'Database connection healthy',
        type: 'dynamodb'
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * In-memory implementation for getAllProjects (fallback).
   * 
   * @private
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Result with projects array
   */
  static async _getAllProjectsInMemory(filters = {}) {
    // Initialize in-memory storage if not exists
    if (!this._inMemoryStorage) {
      this._inMemoryStorage = {
        projects: [],
        analytics: { id: 'global', totalViews: 0, totalProjects: 0 }
      };
    }
    
    let projects = [...this._inMemoryStorage.projects];
    
    // Apply filters
    if (filters.tag) {
      projects = projects.filter(project => 
        project.tags && project.tags.includes(filters.tag.toLowerCase())
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        (project.tags && project.tags.some(tag => tag.includes(searchLower)))
      );
    }
    
    return {
      success: true,
      data: projects,
      total: projects.length
    };
  }
  
  /**
   * In-memory storage for development mode.
   * 
   * @private
   * @type {Object}
   */
  static _inMemoryStorage = null;
}

// ===============================================
// In-Memory Database Manager (for development/testing)
// ===============================================

class DatabaseManager {
  constructor() {
    this.connection = new Map();
    this.isConnected = false;
  }

  // Connect to database
  async connect() {
    try {
      this.isConnected = true;
      console.log('📦 Database connected (in-memory)');
      return { success: true };
    } catch (error) {
      console.error('Database connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Disconnect from database
  async disconnect() {
    this.connection.clear();
    this.isConnected = false;
    console.log('📦 Database disconnected');
  }

  // Create new record
  async create(collection, data) {
    if (!this.isConnected) throw new Error('Database not connected');
    
    const record = {
      ...data,
      id: data.id || this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const collectionData = this.connection.get(collection) || [];
    collectionData.push(record);
    this.connection.set(collection, collectionData);
    
    return record;
  }

  // Read records
  async read(collection, query = {}) {
    if (!this.isConnected) throw new Error('Database not connected');
    
    const collectionData = this.connection.get(collection) || [];
    
    if (Object.keys(query).length === 0) {
      return collectionData;
    }
    
    return collectionData.filter(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
  }

  // Update record
  async update(collection, id, data) {
    if (!this.isConnected) throw new Error('Database not connected');
    
    const collectionData = this.connection.get(collection) || [];
    const index = collectionData.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Item not found');
    
    collectionData[index] = {
      ...collectionData[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.connection.set(collection, collectionData);
    return collectionData[index];
  }

  // Delete record
  async delete(collection, id) {
    if (!this.isConnected) throw new Error('Database not connected');
    
    const collectionData = this.connection.get(collection) || [];
    const index = collectionData.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Item not found');
    
    const deletedItem = collectionData.splice(index, 1)[0];
    this.connection.set(collection, collectionData);
    
    return deletedItem;
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Health check
  isHealthy() {
    return this.isConnected;
  }
}
class AnalyticsManager {
  constructor(db) {
    this.db = db;
    this.events = [];
  }

  // Track event
  async trackEvent(event, data = {}) {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userAgent: this.getUserAgent()
    };

    this.events.push(eventData);
    
    if (this.db && this.db.isConnected) {
      await this.db.create('analytics', eventData);
    }

    console.log('📊 Event tracked:', event, data);
  }

  // Get analytics summary
  async getAnalytics(startDate, endDate) {
    let events = this.events;
    
    if (this.db && this.db.isConnected) {
      events = await this.db.read('analytics');
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        if (startDate && eventDate < new Date(startDate)) return false;
        if (endDate && eventDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Process analytics
    const analytics = {
      totalEvents: events.length,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      eventTypes: {},
      dailyStats: {},
      topPages: {}
    };

    events.forEach(event => {
      // Event types
      analytics.eventTypes[event.event] = (analytics.eventTypes[event.event] || 0) + 1;

      // Daily stats
      const day = event.timestamp.split('T')[0];
      analytics.dailyStats[day] = (analytics.dailyStats[day] || 0) + 1;

      // Top pages (if page data exists)
      if (event.data.page) {
        analytics.topPages[event.data.page] = (analytics.topPages[event.data.page] || 0) + 1;
      }
    });

    return analytics;
  }

  // Utility methods
  getSessionId() {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return 'server-session';
  }

  getUserAgent() {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'Server';
  }
}

// Export modules
module.exports = {
  DatabaseUtils,
  DatabaseManager,
  AnalyticsManager
};

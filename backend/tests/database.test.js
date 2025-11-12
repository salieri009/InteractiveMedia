/**
 * ===============================================
 * Database Utilities Test Suite
 * ===============================================
 * 
 * Comprehensive test cases for DatabaseUtils class.
 * Tests database operations, fallback handling, and error cases.
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */

const { DatabaseUtils } = require('../utils/database');

describe('DatabaseUtils - Environment Detection', () => {
  test('should use in-memory database in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const result = await DatabaseUtils.healthCheck();
    
    expect(result.success).toBe(true);
    expect(result.type).toBe('in-memory');
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('DatabaseUtils - getAllProjects', () => {
  beforeEach(() => {
    // Clear in-memory storage
    DatabaseUtils._inMemoryStorage = null;
  });
  
  test('should return empty array when no projects', async () => {
    const result = await DatabaseUtils.getAllProjects();
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
  
  test('should filter projects by tag', async () => {
    // Add test projects
    await DatabaseUtils.createProject({
      id: 'test1',
      name: 'Test 1',
      description: 'Test',
      tags: ['tag1']
    });
    
    await DatabaseUtils.createProject({
      id: 'test2',
      name: 'Test 2',
      description: 'Test',
      tags: ['tag2']
    });
    
    const result = await DatabaseUtils.getAllProjects({ tag: 'tag1' });
    
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('test1');
  });
  
  test('should filter projects by search term', async () => {
    await DatabaseUtils.createProject({
      id: 'search-test',
      name: 'Searchable Project',
      description: 'This is searchable',
      tags: []
    });
    
    const result = await DatabaseUtils.getAllProjects({ search: 'Searchable' });
    
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});

describe('DatabaseUtils - createProject', () => {
  beforeEach(() => {
    DatabaseUtils._inMemoryStorage = null;
  });
  
  test('should create a new project', async () => {
    const projectData = {
      id: 'new-project',
      name: 'New Project',
      description: 'A new project',
      tags: ['test']
    };
    
    const result = await DatabaseUtils.createProject(projectData);
    
    expect(result.success).toBe(true);
    expect(result.data.id).toBe('new-project');
    expect(result.data.views).toBe(0);
    expect(result.data.likes).toBe(0);
  });
  
  test('should reject duplicate project IDs', async () => {
    const projectData = {
      id: 'duplicate',
      name: 'Duplicate',
      description: 'Test'
    };
    
    await DatabaseUtils.createProject(projectData);
    const result = await DatabaseUtils.createProject(projectData);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('DatabaseUtils - Health Check', () => {
  test('should return healthy status', async () => {
    const result = await DatabaseUtils.healthCheck();
    
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });
});


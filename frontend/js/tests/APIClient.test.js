/**
 * ===============================================
 * APIClient Test Suite
 * ===============================================
 * 
 * Comprehensive test cases for APIClient class.
 * Tests API requests, error handling, and timeout behavior.
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */

// Mock fetch for testing
global.fetch = jest.fn();

describe('APIClient - Request Handling', () => {
  let client;
  
  beforeEach(() => {
    client = new APIClient('http://localhost:3001');
    fetch.mockClear();
  });
  
  test('should make successful API request', async () => {
    const mockResponse = { success: true, data: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    const result = await client.request('/projects');
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects',
      expect.objectContaining({
        mode: 'cors',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
    expect(result).toEqual(mockResponse);
  });
  
  test('should handle API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    
    await expect(client.request('/projects')).rejects.toThrow();
  });
  
  test('should use fallback data on network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    const result = await client.request('/projects');
    
    expect(result).toEqual(client.fallbackData.projects);
  });
  
  test('should handle timeout', async () => {
    client.timeout = 100; // Short timeout for testing
    
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 200))
    );
    
    await expect(client.request('/test')).rejects.toThrow('timeout');
  });
  
  test('should normalize endpoint path', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    
    await client.request('projects'); // No leading slash
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/projects',
      expect.any(Object)
    );
  });
});

describe('APIClient - getAnalytics Bug Fix', () => {
  let client;
  
  beforeEach(() => {
    client = new APIClient('http://localhost:3001');
    fetch.mockClear();
  });
  
  test('should not double /api prefix in getAnalytics', async () => {
    const mockResponse = { success: true, data: {} };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    await client.getAnalytics();
    
    // BUGFIX: Should call /api/analytics, not /api/api/analytics
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/analytics',
      expect.any(Object)
    );
    
    // Verify it's not double-prefixed
    const callUrl = fetch.mock.calls[0][0];
    expect(callUrl).not.toContain('/api/api/');
  });
});

describe('APIClient - Project Methods', () => {
  let client;
  
  beforeEach(() => {
    client = new APIClient();
    fetch.mockClear();
  });
  
  test('should get projects with filters', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });
    
    await client.getProjects({ tag: 'test', search: 'query' });
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('tag=test'),
      expect.any(Object)
    );
  });
  
  test('should like a project', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    await client.likeProject('test-id');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/test-id/like'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });
});


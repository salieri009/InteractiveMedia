// ===============================================
// API Client - Frontend Integration
// ===============================================

class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL || this.getBaseURL();
    this.timeout = 10000; // 10 seconds
    this.fallbackData = {
      projects: [
        { id: 'a1a', name: 'A1A - Basic Shapes', description: 'Simple shapes and drawing' },
        { id: 'a1b', name: 'A1B - Interactive Animation', description: 'Interactive animation with user input' },
        // Add more fallback projects if needed
      ],
      analytics: {
        visits: 100,
        interactions: 50,
        avgTime: 120,
        popular: 'a1b'
      }
    };
  }

  // Determine base URL based on environment
  getBaseURL() {
    if (typeof window !== 'undefined') {
      // Client-side
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      return ''; // Use relative URLs in production
    }
    return 'http://localhost:3001'; // Server-side fallback
  }

  // Generic fetch wrapper with error handling
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}/api${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        // Add mode: 'cors' to explicitly handle CORS
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log(`API Request failed: ${error.message}`);
      
      // Check if it's a CORS error
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('CORS')) {
        console.log('CORS error detected. Using fallback data.');
        
        // Return appropriate fallback data based on the endpoint
        if (endpoint.includes('/projects')) {
          return this.fallbackData.projects;
        } else if (endpoint.includes('/analytics')) {
          return this.fallbackData.analytics;
        }
      }
      
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/health');
  }

  // Project methods
  async getProjects(filters = {}) {
    const params = new URLSearchParams();
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.search) params.append('search', filters.search);
    
    const query = params.toString();
    return this.request(`/projects${query ? `?${query}` : ''}`);
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async likeProject(id) {
    return this.request(`/projects/${id}/like`, {
      method: 'POST'
    });
  }

  // Analytics
  async getAnalytics() {
    try {
      return await this.request('/api/analytics');
    } catch (error) {
      console.log('Using fallback analytics data');
      return this.fallbackData.analytics;
    }
  }

  // Enhanced method to load projects from API with better error handling
  async loadProjectsFromAPI() {
    try {
      const projects = await this.getProjects();
      console.log(`📊 Loaded ${projects.length} projects from API`);
      return projects;
    } catch (error) {
      console.log(`Failed to load projects from API: ${error}`);
      return this.fallbackData.projects;
    }
  }

  // Enhanced method to load analytics with better error handling
  async loadAnalyticsData() {
    try {
      const analytics = await this.getAnalytics();
      console.log('📈 Analytics data loaded successfully');
      return analytics;
    } catch (error) {
      console.log(`Failed to load analytics: ${error}`);
      return this.fallbackData.analytics;
    }
  }
}

// Enhanced UI Controller with API integration
class EnhancedUIController extends UIController {
  constructor() {
    super();
    this.api = new APIClient();
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  // Setup network status listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNotification('Connection restored', 'success');
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('Working offline', 'warning');
    });
  }

  // Initialize with API data
  async initialize() {
    await super.initialize();
    
    if (this.isOnline) {
      try {
        await this.loadProjectsFromAPI();
        await this.loadAnalyticsData();
      } catch (error) {
        console.warn('Failed to load data from API, using local data:', error);
        this.showNotification('Using offline mode', 'info');
      }
    }
  }

  // Load projects from API
  async loadProjectsFromAPI() {
    try {
      const response = await this.api.getProjects();
      if (response.success && response.data.length > 0) {
        this.updateProjectStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load projects from API:', error);
    }
  }

  // Update project statistics
  updateProjectStats(apiProjects) {
    const localProjects = projectManager.getAllProjects();
    
    localProjects.forEach(localProject => {
      const apiProject = apiProjects.find(p => p.id === localProject.id);
      if (apiProject) {
        localProject.views = apiProject.views;
        localProject.likes = apiProject.likes;
        localProject.tags = apiProject.tags;
      }
    });

    this.updateProjectInfo();
  }

  // Enhanced project switching with analytics
  switchProject(projectId) {
    const success = super.switchProject(projectId);
    
    if (success && this.isOnline) {
      // Track project view asynchronously without blocking
      this.api.getProject(projectId).catch(error => {
        console.warn('Failed to track project view:', error);
      });
    }

    return success;
  }

  // Load and display analytics
  async loadAnalytics() {
    try {
      const response = await this.api.getAnalytics();
      if (response.success) {
        this.displayAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  // Display analytics data
  displayAnalytics(data) {
    const analyticsElement = document.getElementById('analytics-panel');
    if (analyticsElement) {
      analyticsElement.innerHTML = `
        <div class="analytics-summary">
          <h4>📊 Project Statistics</h4>
          <p>Total Views: ${data.totalViews}</p>
          <p>Total Projects: ${data.totalProjects}</p>
          <p>Average Views: ${Math.round(data.averageViews)}</p>
        </div>
      `;
    }
  }

  // Show notification to user
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Sync data when connection is restored
  async syncData() {
    try {
      await this.loadProjectsFromAPI();
      await this.loadAnalytics();
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }

  // Enhanced project info update
  updateProjectInfo() {
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject) return;

    const infoElement = document.getElementById('project-info');
    if (infoElement) {
      infoElement.innerHTML = `
        <h3>${currentProject.name}</h3>
        <p>${currentProject.description}</p>
        <div class="project-meta">
          <small>Canvas: ${currentProject.canvasSize.width} × ${currentProject.canvasSize.height}</small>
          ${currentProject.views ? `<small>👀 Views: ${currentProject.views}</small>` : ''}
          ${currentProject.likes ? `<small>❤️ Likes: ${currentProject.likes}</small>` : ''}
        </div>
      `;
    }
  }
}

// Don't replace the global controller automatically
// Let UIController.js handle the initialization

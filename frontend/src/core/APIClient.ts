/**
 * APIClient — Backend HTTP Integration
 *
 * Thin fetch wrapper around the Express backend (`/api/*` routes).
 * Handles timeouts, CORS fallback, and offline graceful degradation.
 *
 * EnhancedUIController extends UIController to add real-time analytics
 * tracking and network-aware project switching.
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
import type { IProject }                       from '../types/project';
import type { IApiResponse, IAnalytics,
              IHealthCheck, IProjectFilters,
              IFallbackData, IApiProject }      from '../types/api';
import { UIController }                        from './UIController';

/** Window extension — exposes core singletons from other modules. */
type GlobalWindow = Window & typeof globalThis & Record<string, unknown>;

/* ================================================================
   APIClient
   ================================================================ */

/**
 * HTTP client for the Express backend.
 *
 * All methods are async and never throw to the caller — network failures
 * are caught internally and return fallback data so the UI remains usable
 * without a running backend.
 */
export class APIClient {
  /** Base URL resolved at construction time. Empty string in production. */
  private readonly baseURL: string;

  /** Maximum milliseconds to wait for a response before aborting. */
  private readonly timeout: number;

  /**
   * Static fallback payloads used when the network is unreachable.
   * Keeps the UI functional in offline / demo environments.
   */
  private readonly fallbackData: IFallbackData;

  constructor(baseURL = '') {
    this.baseURL      = baseURL || this.getBaseURL();
    this.timeout      = 10_000;
    this.fallbackData = {
      projects: [
        { id: 'a1a', name: 'A1A - Basic Shapes',            description: 'Simple shapes and drawing' },
        { id: 'a1b', name: 'A1B - Animated Shapes',         description: 'Interactive animation with user input' },
        { id: 'a1c', name: 'A1C - Pattern Generator',       description: 'Procedural pattern generation' },
        { id: 'a1d', name: 'A1D - Urban Glide',             description: 'Smooth urban scrolling scene' },
        { id: 'a1e', name: 'A1E - Sound-Painted Night Sky', description: 'Microphone-reactive visual art' },
        { id: 'a1g', name: 'A1G - Interactive Pixel Sort',  description: 'Real-time pixel sorting algorithm' },
        { id: 'a1h', name: 'A1H - Corpus Comedian',         description: 'AI-driven text generator' },
        { id: 'a1i', name: 'A1I - The Observant Shopper',   description: 'ML object detection shopping assistant' },
        { id: 'a1j', name: 'A1J - Dungeon Tile Painter',    description: 'Procedural dungeon tile grid painter' },
      ],
      analytics: {
        totalViews:    100,
        totalProjects: 9,
        averageViews:  11,
      },
    };
  }

  /* ================================================================
     Environment detection
     ================================================================ */

  /**
   * Resolves the API base URL from the current browser location.
   *
   * Returns the full `localhost:3001` origin during local development so
   * CORS preflight requests reach the correct Express port. Returns an
   * empty string in production so all requests use relative paths
   * (handled by the same-origin Express server or a reverse proxy).
   */
  private getBaseURL(): string {
    if (typeof window !== 'undefined') {
      const { hostname } = window.location;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      return ''; // relative URLs in production
    }
    return 'http://localhost:3001'; // server-side fallback
  }

  /* ================================================================
     Core request primitive
     ================================================================ */

  /**
   * Generic fetch wrapper with AbortController timeout and CORS fallback.
   *
   * Automatically prepends `/api` to `endpoint`. Normalises the leading
   * slash so callers can pass either `'/projects'` or `'projects'`.
   *
   * @param endpoint - Route path without the `/api` prefix (e.g. `/projects`)
   * @param options  - Standard `RequestInit` options (method, body, headers…)
   * @returns Parsed JSON response cast to `T`
   * @throws Error on timeout, non-2xx status, or unrecoverable network failure
   *
   * @example
   * const data = await client.request<IApiResponse<IApiProject[]>>('/projects');
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Invalid endpoint provided');
    }

    /* Normalise leading slash */
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const url        = `${this.baseURL}/api${path}`;
    const controller = new AbortController();
    const timeoutId  = setTimeout((): void => { controller.abort(); }, this.timeout);

    console.log(`API request: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        signal:  controller.signal,
        mode:    'cors',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string> | undefined),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }

      return (await response.json()) as T;

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const err = error as Error;

      /* Timeout */
      if (err.name === 'AbortError') {
        console.warn(`API request timed out after ${this.timeout}ms: ${path}`);
        throw new Error(`Request timeout: ${path}`);
      }

      /* CORS / network failure — return fallback data instead of crashing */
      const msg = err.message ?? '';
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('CORS')            ||
        msg.includes('NetworkError')
      ) {
        console.warn('Network error — returning fallback data for:', path);

        if (path.includes('/projects')) {
          return this.fallbackData.projects as unknown as T;
        }
        if (path.includes('/analytics')) {
          return this.fallbackData.analytics as unknown as T;
        }
      }

      throw error;
    }
  }

  /* ================================================================
     API methods
     ================================================================ */

  /**
   * Pings `/api/health` to verify the backend is reachable.
   * Used on startup to decide whether to show offline-mode notices.
   */
  async health(): Promise<IHealthCheck> {
    return this.request<IHealthCheck>('/health');
  }

  /**
   * Fetches the full project list, optionally filtered by tag or search term.
   *
   * @param filters - Optional `tag` and/or `search` query params
   */
  async getProjects(filters: IProjectFilters = {}): Promise<IApiResponse<IApiProject[]>> {
    const params = new URLSearchParams();
    if (filters.tag)    params.append('tag',    filters.tag);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    return this.request<IApiResponse<IApiProject[]>>(
      `/projects${query ? `?${query}` : ''}`
    );
  }

  /**
   * Fetches a single project by id.
   * Side-effect: increments the backend view counter for the project.
   *
   * @param id - Project identifier (e.g. `"a1a"`)
   */
  async getProject(id: string): Promise<IApiResponse<IApiProject>> {
    return this.request<IApiResponse<IApiProject>>(`/projects/${id}`);
  }

  /**
   * Creates a new project record in the backend database.
   *
   * @param projectData - Partial project data sent as JSON body
   */
  async createProject(projectData: Partial<IProject>): Promise<IApiResponse<IApiProject>> {
    return this.request<IApiResponse<IApiProject>>('/projects', {
      method: 'POST',
      body:   JSON.stringify(projectData),
    });
  }

  /**
   * Increments the like counter for a project.
   *
   * @param id - Project identifier (e.g. `"a1a"`)
   */
  async likeProject(id: string): Promise<IApiResponse<{ likes: number }>> {
    return this.request<IApiResponse<{ likes: number }>>(`/projects/${id}/like`, {
      method: 'POST',
    });
  }

  /**
   * Fetches aggregate analytics (total views, popular project, etc.).
   * Falls back to static data if the request fails.
   */
  async getAnalytics(): Promise<IApiResponse<IAnalytics>> {
    try {
      return await this.request<IApiResponse<IAnalytics>>('/analytics');
    } catch {
      console.log('Using fallback analytics data');
      return { success: true, data: this.fallbackData.analytics as unknown as IAnalytics };
    }
  }

  /* ================================================================
     Convenience loaders (used by EnhancedUIController)
     ================================================================ */

  /**
   * Loads projects from the API, returning the fallback list on failure.
   * Never throws — safe to call unconditionally on startup.
   */
  async loadProjectsFromAPI(): Promise<IApiProject[]> {
    try {
      const response = await this.getProjects();
      const projects = response.data ?? [];
      console.log(`Loaded ${projects.length} projects from API`);
      return projects;
    } catch (error: unknown) {
      console.warn(`Failed to load projects from API: ${(error as Error).message}`);
      return this.fallbackData.projects as unknown as IApiProject[];
    }
  }

  /**
   * Loads analytics data, returning the fallback object on failure.
   * Never throws — safe to call unconditionally on startup.
   */
  async loadAnalyticsData(): Promise<IAnalytics> {
    try {
      const response = await this.getAnalytics();
      console.log('Analytics data loaded successfully');
      return response.data ?? (this.fallbackData.analytics as unknown as IAnalytics);
    } catch (error: unknown) {
      console.warn(`Failed to load analytics: ${(error as Error).message}`);
      return this.fallbackData.analytics as unknown as IAnalytics;
    }
  }
}

/* ================================================================
   EnhancedUIController
   ================================================================ */

/**
 * UIController subclass that layers in API integration.
 *
 * Adds:
 * - Project statistics sync (views / likes / tags) on startup
 * - Analytics tracking on every project switch
 * - Network-aware notifications (online / offline events)
 * - Richer project-info panel with view and like counts
 */
export class EnhancedUIController extends UIController {
  /** Shared APIClient instance for all backend calls. */
  private readonly api: APIClient;

  /** Mirrors `navigator.onLine`, updated by network listeners. */
  private isOnline: boolean;

  constructor() {
    super();
    this.api      = new APIClient();
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  /* ================================================================
     Lifecycle
     ================================================================ */

  /**
   * Extends base `initialize()` with an async API data load.
   * Falls back gracefully if the backend is unreachable.
   */
  async initialize(): Promise<void> {
    super.initialize();

    if (this.isOnline) {
      try {
        await this.loadProjectsFromAPI();
        await this.loadAnalyticsData();
      } catch (error: unknown) {
        console.warn('Failed to load data from API — using local data:', error);
        this.showNotification('Using offline mode', 'info');
      }
    }
  }

  /* ================================================================
     Network awareness
     ================================================================ */

  /**
   * Registers `online` / `offline` window event listeners so the UI
   * can notify the user and re-sync data when connectivity is restored.
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', (): void => {
      this.isOnline = true;
      this.showNotification('Connection restored', 'success');
      void this.syncData();
    });

    window.addEventListener('offline', (): void => {
      this.isOnline = false;
      this.showNotification('Working offline', 'warning');
    });
  }

  /* ================================================================
     Data loading
     ================================================================ */

  /** Fetches projects from API and merges stats into local ProjectManager records. */
  private async loadProjectsFromAPI(): Promise<void> {
    try {
      const response = await this.api.getProjects();
      if (response.success && (response.data?.length ?? 0) > 0) {
        this.updateProjectStats(response.data ?? []);
      }
    } catch (error: unknown) {
      console.error('Failed to load projects from API:', error);
    }
  }

  /**
   * Merges API-sourced statistics (views, likes, tags) into the
   * locally registered project records held by ProjectManager.
   *
   * @param apiProjects - Array of API project records with statistics
   */
  private updateProjectStats(apiProjects: IApiProject[]): void {
    const pm           = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const localProjects = pm.getAllProjects();

    localProjects.forEach((local): void => {
      const api = apiProjects.find((p): boolean => p.id === local.id);
      if (api) {
        local.views = api.views;
        local.likes = api.likes;
        local.tags  = api.tags;
      }
    });

    this.updateProjectInfo();
  }

  /** Loads analytics data and renders the `#analytics-panel` if it exists. */
  private async loadAnalyticsData(): Promise<void> {
    try {
      const response = await this.api.getAnalytics();
      if (response.success && response.data) {
        this.displayAnalytics(response.data);
      }
    } catch (error: unknown) {
      console.error('Failed to load analytics:', error);
    }
  }

  /**
   * Renders summary analytics into `#analytics-panel`.
   * Panel is optional — no-ops silently when the element is absent.
   *
   * @param data - Analytics payload from the backend
   */
  private displayAnalytics(data: IAnalytics): void {
    const panel = document.getElementById('analytics-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="analytics-summary">
        <h4>Project Statistics</h4>
        <p>Total Views: ${data.totalViews}</p>
        <p>Total Projects: ${data.totalProjects}</p>
        <p>Average Views: ${Math.round(data.averageViews)}</p>
      </div>
    `;
  }

  /* ================================================================
     Overrides
     ================================================================ */

  /**
   * Switches project and asynchronously records the view via API.
   * Fires-and-forgets the tracking request — the UI switch is never blocked.
   *
   * @param projectId - Target project id
   * @returns true on success, false if the underlying switch failed
   */
  switchProject(projectId: string): boolean {
    const success = super.switchProject(projectId);

    if (success && this.isOnline) {
      /* Track view without blocking the UI */
      this.api.getProject(projectId).catch((error: unknown): void => {
        console.warn('Failed to track project view:', error);
      });
    }

    return success;
  }

  /**
   * Renders the project info panel with optional view/like counts
   * when API data has been loaded.
   */
  protected override updateProjectInfo(): void {
    const pm      = (window as GlobalWindow)['projectManager'] as InstanceType<typeof import('./ProjectManager').ProjectManager>;
    const current = pm.getCurrentProject();
    if (!current) return;

    const el = document.getElementById('project-info');
    if (!el) return;

    const viewsHtml = current.views != null
      ? `<small>Views: ${current.views}</small>`
      : '';
    const likesHtml = current.likes != null
      ? `<small>Likes: ${current.likes}</small>`
      : '';

    el.innerHTML = `
      <h3>${current.name}</h3>
      <p>${current.description}</p>
      <div class="project-meta">
        <small>Canvas: ${current.canvasSize.width} \xd7 ${current.canvasSize.height}</small>
        ${viewsHtml}
        ${likesHtml}
      </div>
    `;
  }

  /* ================================================================
     Notifications
     ================================================================ */

  /**
   * Appends a transient notification banner to `document.body`.
   * Auto-removes after 3 seconds.
   *
   * @param message - Human-readable notification text
   * @param type    - Visual variant: `'info' | 'success' | 'warning' | 'error'`
   */
  showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const el       = document.createElement('div');
    el.className   = `notification notification-${type}`;
    el.textContent = message;

    document.body.appendChild(el);
    setTimeout((): void => { el.remove(); }, 3000);
  }

  /* ================================================================
     Sync
     ================================================================ */

  /**
   * Re-fetches projects and analytics after a network reconnection.
   * Called automatically by the `online` event listener.
   */
  private async syncData(): Promise<void> {
    try {
      await this.loadProjectsFromAPI();
      await this.loadAnalyticsData();
    } catch (error: unknown) {
      console.error('Failed to sync data:', error);
    }
  }
}

/* ================================================================
   Global singleton
   ================================================================ */
export const apiClient = new APIClient();
(window as GlobalWindow)['apiClient'] = apiClient;

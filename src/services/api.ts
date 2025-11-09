import { AnimeSearchResponse, AnimeDetailsResponse } from '../types';
import cacheService from './cache';

const BASE_URL = 'https://api.jikan.moe/v4';

// API rate limiting: max 3 requests per second, 60 requests per minute
class ApiService {
  private abortControllers: Map<string, AbortController> = new Map();
  private requestCounter = 0;

  // Cancel request by type (search, top, details)
  cancelRequest(requestType?: string) {
    if (requestType && this.abortControllers.has(requestType)) {
      this.abortControllers.get(requestType)?.abort();
      this.abortControllers.delete(requestType);
    } else if (!requestType) {
      // Cancel all requests if no type specified
      this.abortControllers.forEach(controller => controller.abort());
      this.abortControllers.clear();
    }
  }

  // Generic API request method with error handling
  private async makeRequest<T>(url: string, requestType: string): Promise<T> {
    // Cancel previous request of this type and create a fresh controller
    this.cancelRequest(requestType);
    const abortController = new AbortController();
    this.abortControllers.set(requestType, abortController);

    const reqId = ++this.requestCounter;
    const start = Date.now();
    // Pre-request debug
    // Using console.debug so it's easy to filter in devtools
    console.debug('[api] Request start', { reqId, url, requestType, start, stack: new Error().stack });

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      const duration = Date.now() - start;

      if (!response.ok) {
        // Log non-2xx responses with details
        console.error('[api] Request failed (non-OK)', {
          reqId,
          url,
          status: response.status,
          statusText: response.statusText,
          duration,
        });

        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 404) {
          throw new Error('Anime not found.');
        }

        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Post-request debug
      console.debug('[api] Request success', {
        reqId,
        url,
        requestType,
        status: response.status,
        duration,
        dataSummary: Array.isArray((data as any).data) ? `${(data as any).data.length} items` : typeof data,
      });

      // Clean up controller for this request type
      this.abortControllers.delete(requestType);
      return data;
    } catch (error) {
      const duration = Date.now() - start;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('[api] Request aborted', { reqId, url, requestType, duration });
          // Clean up controller for this request type
          this.abortControllers.delete(requestType);
          throw new Error('Request was cancelled');
        }

        // Network errors (e.g. DNS, connection reset) often come through as TypeError: Failed to fetch
        if (error instanceof TypeError) {
          console.error('[api] Network/Fetch error', { reqId, url, requestType, duration, message: error.message });
        } else {
          console.error('[api] Request error', { reqId, url, requestType, duration, message: error.message });
        }

        // Clean up controller for this request type on any error
        this.abortControllers.delete(requestType);
        throw error;
      }

      console.error('[api] Unknown request error', { reqId, url, requestType, duration });
      this.abortControllers.delete(requestType);
      throw new Error('An unexpected error occurred');
    }
  }

  // Search anime with pagination
  async searchAnime(
    query: string, 
    page: number = 1, 
    limit: number = 25
  ): Promise<AnimeSearchResponse> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    const trimmedQuery = query.trim();

    // Check cache first
    const cachedResult = cacheService.getSearchFromCache(trimmedQuery, page);
    if (cachedResult) {
      console.debug('[api] Cache hit for search', { query: trimmedQuery, page });
      return cachedResult;
    }

    const params = new URLSearchParams({
      q: trimmedQuery,
      page: page.toString(),
      limit: limit.toString(),
      order_by: 'popularity',
      sort: 'asc'
    });

    const url = `${BASE_URL}/anime?${params}`;
    const response = await this.makeRequest<AnimeSearchResponse>(url, 'search');
    
    // Cache the result
    cacheService.setSearchCache(trimmedQuery, page, response, url);
    
    return response;
  }

  // Get anime details by ID
  async getAnimeDetails(id: number): Promise<AnimeDetailsResponse> {
    if (!id || id <= 0) {
      throw new Error('Invalid anime ID');
    }

    // Check cache first
    const cachedAnime = cacheService.getDetailsFromCache(id);
    if (cachedAnime) {
      console.debug('[api] Cache hit for anime details', { id });
      return { data: cachedAnime };
    }

    const url = `${BASE_URL}/anime/${id}`;
    const response = await this.makeRequest<AnimeDetailsResponse>(url, 'details');
    
    // Cache the result
    if (response.data) {
      cacheService.setDetailsCache(response.data, url);
    }
    
    return response;
  }

  // Get top anime (for homepage if needed)
  async getTopAnime(page: number = 1, limit: number = 25): Promise<AnimeSearchResponse> {
    // Use special query "TOP_ANIME" for caching top anime results
    const cacheQuery = `TOP_ANIME`;
    
    // Check cache first
    const cachedResult = cacheService.getSearchFromCache(cacheQuery, page);
    if (cachedResult) {
      console.debug('[api] Cache hit for top anime', { page });
      return cachedResult;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const url = `${BASE_URL}/top/anime?${params}`;
    const response = await this.makeRequest<AnimeSearchResponse>(url, 'top');
    
    // Cache the result
    cacheService.setSearchCache(cacheQuery, page, response, url);
    
    return response;
  }

  // Get anime recommendations (for related anime)
  async getAnimeRecommendations(id: number): Promise<any> {
    if (!id || id <= 0) {
      throw new Error('Invalid anime ID');
    }

    const url = `${BASE_URL}/anime/${id}/recommendations`;
    return this.makeRequest(url, 'recommendations');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
import { Anime, AnimeSearchResponse } from '../types';

interface DetailsCacheEntry {
  data: Anime;
  timestamp: number;
  url: string;
}

interface SearchCacheEntry {
  data: AnimeSearchResponse;
  timestamp: number;
  url: string;
  query: string;
  page: number;
}

class CacheService {
  private readonly DETAILS_CACHE_KEY = 'anime_details_cache';
  private readonly SEARCH_CACHE_KEY = 'anime_search_cache';
  private readonly MAX_DETAILS_ENTRIES = 5;
  private readonly MAX_SEARCH_ENTRIES = 10; // Cache more search results
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Details Cache Methods
  getDetailsFromCache(id: number): Anime | null {
    try {
      const cached = localStorage.getItem(this.DETAILS_CACHE_KEY);
      if (!cached) return null;

      const entries: DetailsCacheEntry[] = JSON.parse(cached);
      const entry = entries.find(e => e.data.mal_id === id);

      if (!entry) return null;

      // Check if cache is still valid
      if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
        this.removeDetailsFromCache(id);
        return null;
      }

      console.debug('[cache] Details hit', { id, url: entry.url, age: Date.now() - entry.timestamp });
      return entry.data;
    } catch (error) {
      console.error('[cache] Failed to read details cache:', error);
      return null;
    }
  }

  setDetailsCache(anime: Anime, url: string): void {
    try {
      const cached = localStorage.getItem(this.DETAILS_CACHE_KEY);
      let entries: DetailsCacheEntry[] = cached ? JSON.parse(cached) : [];

      // Remove existing entry for this anime if it exists
      entries = entries.filter(e => e.data.mal_id !== anime.mal_id);

      // Add new entry at the beginning
      entries.unshift({
        data: anime,
        timestamp: Date.now(),
        url
      });

      // Keep only the most recent entries
      if (entries.length > this.MAX_DETAILS_ENTRIES) {
        entries = entries.slice(0, this.MAX_DETAILS_ENTRIES);
      }

      localStorage.setItem(this.DETAILS_CACHE_KEY, JSON.stringify(entries));
      console.debug('[cache] Details stored', { id: anime.mal_id, url, totalEntries: entries.length });
    } catch (error) {
      console.error('[cache] Failed to store details cache:', error);
    }
  }

  removeDetailsFromCache(id: number): void {
    try {
      const cached = localStorage.getItem(this.DETAILS_CACHE_KEY);
      if (!cached) return;

      const entries: DetailsCacheEntry[] = JSON.parse(cached);
      const filtered = entries.filter(e => e.data.mal_id !== id);

      if (filtered.length !== entries.length) {
        localStorage.setItem(this.DETAILS_CACHE_KEY, JSON.stringify(filtered));
        console.debug('[cache] Details removed', { id });
      }
    } catch (error) {
      console.error('[cache] Failed to remove from details cache:', error);
    }
  }

  // Search Cache Methods
  getSearchFromCache(query: string, page: number): AnimeSearchResponse | null {
    try {
      const cached = localStorage.getItem(this.SEARCH_CACHE_KEY);
      if (!cached) return null;

      const entries: SearchCacheEntry[] = JSON.parse(cached);
      const entry = entries.find(e => 
        e.query === query && 
        e.page === page
      );

      if (!entry) return null;

      // Check if cache is still valid
      if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
        this.removeSearchFromCache(query, page);
        return null;
      }

      console.debug('[cache] Search hit', { 
        query, 
        page, 
        url: entry.url, 
        age: Date.now() - entry.timestamp,
        resultCount: entry.data.data.length
      });
      return entry.data;
    } catch (error) {
      console.error('[cache] Failed to read search cache:', error);
      return null;
    }
  }

  setSearchCache(query: string, page: number, data: AnimeSearchResponse, url: string): void {
    try {
      const cached = localStorage.getItem(this.SEARCH_CACHE_KEY);
      let entries: SearchCacheEntry[] = cached ? JSON.parse(cached) : [];

      // Remove existing entry for this query+page if it exists
      entries = entries.filter(e => !(e.query === query && e.page === page));

      // Add new entry at the beginning
      entries.unshift({
        data,
        timestamp: Date.now(),
        url,
        query,
        page
      });

      // Keep only the most recent entries
      if (entries.length > this.MAX_SEARCH_ENTRIES) {
        entries = entries.slice(0, this.MAX_SEARCH_ENTRIES);
      }

      localStorage.setItem(this.SEARCH_CACHE_KEY, JSON.stringify(entries));
      console.debug('[cache] Search stored', { 
        query, 
        page, 
        url, 
        resultCount: data.data.length,
        totalEntries: entries.length 
      });
    } catch (error) {
      console.error('[cache] Failed to store search cache:', error);
    }
  }

  removeSearchFromCache(query: string, page: number): void {
    try {
      const cached = localStorage.getItem(this.SEARCH_CACHE_KEY);
      if (!cached) return;

      const entries: SearchCacheEntry[] = JSON.parse(cached);
      const filtered = entries.filter(e => !(e.query === query && e.page === page));

      if (filtered.length !== entries.length) {
        localStorage.setItem(this.SEARCH_CACHE_KEY, JSON.stringify(filtered));
        console.debug('[cache] Search removed', { query, page });
      }
    } catch (error) {
      console.error('[cache] Failed to remove from search cache:', error);
    }
  }

  // Cache Management
  getCachedDetails(): DetailsCacheEntry[] {
    try {
      const cached = localStorage.getItem(this.DETAILS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('[cache] Failed to read details cache:', error);
      return [];
    }
  }

  getCachedSearches(): SearchCacheEntry[] {
    try {
      const cached = localStorage.getItem(this.SEARCH_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('[cache] Failed to read search cache:', error);
      return [];
    }
  }

  clearAllCache(): void {
    try {
      localStorage.removeItem(this.DETAILS_CACHE_KEY);
      localStorage.removeItem(this.SEARCH_CACHE_KEY);
      console.debug('[cache] All cache cleared');
    } catch (error) {
      console.error('[cache] Failed to clear cache:', error);
    }
  }

  clearExpiredEntries(): void {
    try {
      const now = Date.now();
      
      // Clean details cache
      const detailsCached = localStorage.getItem(this.DETAILS_CACHE_KEY);
      if (detailsCached) {
        const detailsEntries: DetailsCacheEntry[] = JSON.parse(detailsCached);
        const validDetailsEntries = detailsEntries.filter(
          e => now - e.timestamp <= this.CACHE_DURATION
        );
        if (validDetailsEntries.length !== detailsEntries.length) {
          localStorage.setItem(this.DETAILS_CACHE_KEY, JSON.stringify(validDetailsEntries));
        }
      }

      // Clean search cache
      const searchCached = localStorage.getItem(this.SEARCH_CACHE_KEY);
      if (searchCached) {
        const searchEntries: SearchCacheEntry[] = JSON.parse(searchCached);
        const validSearchEntries = searchEntries.filter(
          e => now - e.timestamp <= this.CACHE_DURATION
        );
        if (validSearchEntries.length !== searchEntries.length) {
          localStorage.setItem(this.SEARCH_CACHE_KEY, JSON.stringify(validSearchEntries));
        }
      }

      console.debug('[cache] Expired entries cleaned');
    } catch (error) {
      console.error('[cache] Failed to clean expired entries:', error);
    }
  }

  getCacheStats() {
    const details = this.getCachedDetails();
    const searches = this.getCachedSearches();
    
    return {
      detailsCount: details.length,
      searchesCount: searches.length,
      totalSize: JSON.stringify(details).length + JSON.stringify(searches).length,
      oldestDetails: details.length > 0 ? Math.min(...details.map(e => e.timestamp)) : null,
      oldestSearch: searches.length > 0 ? Math.min(...searches.map(e => e.timestamp)) : null,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
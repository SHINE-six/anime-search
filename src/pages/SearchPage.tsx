import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Fade,
  Paper,
  Button,
} from '@mui/material';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { searchAnime, loadTopAnime, setQuery, setCurrentPage, clearError } from '../store/searchSlice';
import SearchBar from '../components/SearchBar';
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard';
import SearchPagination from '../components/SearchPagination';
import CacheManager from '../components/CacheManager';

const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    query, 
    results, 
    loading, 
    error, 
    pagination, 
    currentPage 
  } = useAppSelector((state) => state.search);
  const initialLoadRef = useRef(false);
  const loadingRef = useRef(false);
  const [cacheManagerOpen, setCacheManagerOpen] = useState(false);

  // Load top anime on initial mount
  useEffect(() => {
    if (!initialLoadRef.current && results.length === 0 && !query && !loadingRef.current) {
      initialLoadRef.current = true;
      loadingRef.current = true;
      
      (async () => {
        const url = `https://api.jikan.moe/v4/top/anime?page=1`;
        console.debug('[search] Initial load - pre-fetch', { url, timestamp: Date.now() });
        try {
          const payload = await (dispatch(loadTopAnime(1)) as any).unwrap();
          console.debug('[search] Initial load - success', { url, payload });
        } catch (err) {
          console.error('[search] Initial load - failed', { url, error: err });
        } finally {
          loadingRef.current = false;
        }
      })();
    }
  }, [dispatch, results.length, query]);

  const handleSearch = useCallback((searchQuery: string) => {
    if (loadingRef.current) return; // Prevent concurrent requests
    
    loadingRef.current = true;
    (async () => {
      dispatch(setQuery(searchQuery));
      dispatch(setCurrentPage(1));

      const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&page=1`;
      console.debug('[search] User search - pre-fetch', { query: searchQuery, url, timestamp: Date.now() });

      try {
        const payload = await (dispatch(searchAnime({ query: searchQuery, page: 1 })) as any).unwrap();
        console.debug('[search] User search - success', { query: searchQuery, url, payload });
      } catch (err) {
        console.error('[search] User search - failed', { query: searchQuery, url, error: err });
      } finally {
        loadingRef.current = false;
      }
    })();
  }, [dispatch]);

  const handleClear = useCallback(() => {
    if (loadingRef.current) return; // Prevent concurrent requests
    
    loadingRef.current = true;
    (async () => {
      dispatch(setQuery(''));
      dispatch(setCurrentPage(1));

      const url = `https://api.jikan.moe/v4/top/anime?page=1`;
      console.debug('[search] Clear search - pre-fetch top', { url, timestamp: Date.now() });
      try {
        const payload = await (dispatch(loadTopAnime(1)) as any).unwrap();
        console.debug('[search] Clear search - success', { url, payload });
      } catch (err) {
        console.error('[search] Clear search - failed', { url, error: err });
      } finally {
        loadingRef.current = false;
      }
    })();
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    if (loadingRef.current) return; // Prevent concurrent requests
    
    loadingRef.current = true;
    (async () => {
      dispatch(setCurrentPage(page));

      if (query) {
        const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}`;
        console.debug('[search] Page change - pre-fetch', { page, query, url, timestamp: Date.now() });
        try {
          const payload = await (dispatch(searchAnime({ query, page })) as any).unwrap();
          console.debug('[search] Page change - success', { page, query, url, payload });
        } catch (err) {
          console.error('[search] Page change - failed', { page, query, url, error: err });
        }
      } else {
        const url = `https://api.jikan.moe/v4/top/anime?page=${page}`;
        console.debug('[search] Page change - pre-fetch top', { page, url, timestamp: Date.now() });
        try {
          const payload = await (dispatch(loadTopAnime(page)) as any).unwrap();
          console.debug('[search] Page change - success top', { page, url, payload });
        } catch (err) {
          console.error('[search] Page change - failed top', { page, url, error: err });
        }
      }
    })();
  };

  const handleErrorClose = () => {
    dispatch(clearError());
  };

  const renderSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <Box key={`skeleton-${index}`} sx={{ minWidth: 250, flex: '1 1 300px' }}>
        <AnimeCardSkeleton />
      </Box>
    ));
  };

  const renderEmptyState = () => {
    if (query && !loading && results.length === 0) {
      return (
        <Fade in timeout={300}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'grey.50',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 2,
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No anime found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search terms or check for typos.
            </Typography>
          </Paper>
        </Fade>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Anime Search
          </Typography>
          
          {/* Cache Manager Button */}
          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCacheManagerOpen(true)}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <StorageIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>
        </Box>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover your next favorite anime
        </Typography>
        
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClear}
          loading={loading}
          initialValue={query}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Fade in timeout={300}>
          <Alert
            severity="error"
            onClose={handleErrorClose}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Section Title */}
      {!loading && results.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {query ? (
            <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
          ) : (
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          )}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            {query ? `Search Results for "${query}"` : 'Top Anime'}
          </Typography>
        </Box>
      )}

      {/* Results Grid */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'center',
        }}
      >
        {loading ? (
          renderSkeletons()
        ) : results.length > 0 ? (
          results.map((anime) => (
            <Box key={anime.mal_id} sx={{ minWidth: 250, flex: '1 1 300px', maxWidth: 350 }}>
              <Fade in timeout={300}>
                <div>
                  <AnimeCard anime={anime} />
                </div>
              </Fade>
            </Box>
          ))
        ) : (
          <Box sx={{ width: '100%' }}>
            {renderEmptyState()}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {!loading && results.length > 0 && (
        <SearchPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {/* Cache Manager Dialog */}
      <CacheManager
        open={cacheManagerOpen}
        onClose={() => setCacheManagerOpen(false)}
      />
    </Container>
  );
};

export default SearchPage;
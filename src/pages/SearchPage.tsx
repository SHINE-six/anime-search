import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  Fade,
  Paper,
  Grid,
} from '@mui/material';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { searchAnime, loadTopAnime, setQuery, setCurrentPage, clearError } from '../store/searchSlice';
import SearchBar from '../components/SearchBar';
import { AnimeCardSkeleton } from '../components/AnimeCard';
import SearchPagination from '../components/SearchPagination';
import CacheManager from '../components/CacheManager';
import AnimatedHeader from '../components/AnimatedHeader';
import AnimeScene3D from '../components/AnimeScene3D';
import FlipCard from '../components/FlipCard';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
  const [is3DMode, setIs3DMode] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('anime-search-3d-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSearch, setShowSearch] = useState(false);

  // Save 3D mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('anime-search-3d-mode', JSON.stringify(is3DMode));
  }, [is3DMode]);

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
      <div key={`skeleton-${index}`} style={{ minWidth: 250, flex: '1 1 300px' }}>
        <AnimeCardSkeleton />
      </div>
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

  // Calculate main genre from current results or fallback to default
  const mainGenre = results.length > 0 && results[0].genres?.length > 0 
    ? results[0].genres[0].name 
    : 'default';

  const handleAnimeClick = (anime: any) => {
    navigate(`/anime/${anime.mal_id}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
      {/* Animated Header */}
      <AnimatedHeader
        title={query ? `Search: ${query}` : 'Anime Search'}
        showSearch={true}
        onSearchClick={() => setShowSearch(!showSearch)}
        is3DMode={is3DMode}
        onToggle3DMode={setIs3DMode}
        onOpenCacheManager={() => setCacheManagerOpen(true)}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Control Panel */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Discover your next favorite anime
          </Typography>
          
          {(showSearch || query) && (
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClear}
              loading={loading}
              initialValue={query}
            />
          )}
        </Paper>

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

        {/* 3D Scene or Regular Grid */}
        {is3DMode && !loading ? (
          <div style={{ marginBottom: 16 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
              3D Anime Collection
            </Typography>
            <AnimeScene3D
              animeList={results}
              onAnimeClick={handleAnimeClick}
              mainGenre={mainGenre}
            />
          </div>
        ) : null}

        {/* Section Title for 2D Mode */}
        {!is3DMode && !loading && results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {query ? (
              <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
            ) : (
              <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            )}
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
              {query ? `Search Results for "${query}"` : 'Top Anime'}
            </Typography>
          </div>
        )}

        {/* Results Grid - Enhanced with Flip Cards */}
        {!is3DMode && (
          <div style={{ marginBottom: 32 }}>
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  justifyContent: 'center',
                }}
              >
                {renderSkeletons()}
              </div>
            ) : results.length > 0 ? (
              <Grid container spacing={3}>
                {results.map((anime, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={anime.mal_id}>
                    <FlipCard anime={anime} delay={index * 0.1} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <div style={{ width: '100%' }}>
                {renderEmptyState()}
              </div>
            )}
          </div>
        )}

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
    </div>
  );
};

export default SearchPage;
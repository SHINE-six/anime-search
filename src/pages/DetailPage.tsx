import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Alert,
  Paper,
  Chip,
  Rating,
  Skeleton,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Star as StarIcon,
  CalendarToday as CalendarTodayIcon,
  Tv as TvIcon,
  Movie as MovieIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAnimeDetails, clearAnimeDetails, clearError } from '../store/animeDetailsSlice';
import cacheService from '../services/cache';
import { Anime } from '../types';
import AnimatedHeader from '../components/AnimatedHeader';

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { anime, loading, error } = useAppSelector((state) => state.animeDetails);
  const loadingRef = useRef(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const currentIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!(id && !isNaN(Number(id)))) {
        navigate('/');
        return;
      }

      // Prevent concurrent requests for the same ID
      if (loadingRef.current && currentIdRef.current === id) {
        console.debug('[detail] Skipping duplicate request', { id, currentId: currentIdRef.current });
        return;
      }

      // Clear previous anime data if switching to different anime
      if (currentIdRef.current !== id) {
        dispatch(clearAnimeDetails());
      }

      loadingRef.current = true;
      currentIdRef.current = id;

      const numericId = Number(id);
      
      // Check if anime is in cache before making request
      const cachedAnime = cacheService.getDetailsFromCache(numericId);
      if (cachedAnime && mounted) {
        console.debug('[detail] Found in cache, skipping API request', { id: numericId, title: cachedAnime.title });
        setIsFromCache(true);
        // Still dispatch to update Redux state even with cached data
        dispatch(fetchAnimeDetails(numericId));
        return;
      }

      const url = `https://api.jikan.moe/v4/anime/${numericId}`;
      console.debug('[detail] Navigation - pre-fetch', { id: numericId, url, timestamp: Date.now() });
      setIsFromCache(false);

      try {
        // dispatch and unwrap to get actual result or throw
        // "unwrap" will reject if the thunk was rejected
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const payload = await (dispatch(fetchAnimeDetails(numericId)) as any).unwrap();
        if (mounted) {
          console.debug('[detail] Fetch success', { id: numericId, url, payload });
        }
      } catch (err) {
        console.error('[detail] Fetch failed', { id: numericId, url, error: err });
      } finally {
        if (mounted && currentIdRef.current === id) {
          loadingRef.current = false;
        }
      }
    };

    load();

    // Cleanup on unmount
    return () => {
      mounted = false;
      loadingRef.current = false;
      // Only clear if this component is actually unmounting, not just switching IDs
      if (currentIdRef.current === id) {
        dispatch(clearAnimeDetails());
        currentIdRef.current = null;
      }
    };
  }, [id, dispatch, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleErrorClose = () => {
    dispatch(clearError());
  };

  const getImageUrl = (anime: Anime) => {
    return anime.images?.jpg?.large_image_url || 
           anime.images?.jpg?.image_url || 
           'https://via.placeholder.com/300x400/e0e0e0/757575?text=No+Image';
  };

  const formatScore = (score: number | null) => {
    return score ? score.toFixed(1) : 'N/A';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderTrailer = (anime: Anime) => {
    if (anime.trailer?.youtube_id) {
      return (
        <div style={{ marginTop: 24 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PlayArrowIcon sx={{ mr: 1 }} />
            Trailer
          </Typography>
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: 8,
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px',
              }}
              allowFullScreen
              title={`${anime.title} Trailer`}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderGenres = (anime: Anime) => {
    const allGenres = [
      ...anime.genres,
      ...anime.themes,
      ...anime.demographics,
    ].filter(genre => genre);

    if (allGenres.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Typography variant="subtitle2" gutterBottom>
          Genres & Themes
        </Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allGenres.map((genre) => (
            <Chip
              key={`${genre.type}-${genre.mal_id}`}
              label={genre.name}
              variant="outlined"
              size="small"
              color="primary"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderStudios = (anime: Anime) => {
    if (anime.studios.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Typography variant="subtitle2" gutterBottom>
          Studios
        </Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {anime.studios.map((studio) => (
            <Chip
              key={studio.mal_id}
              label={studio.name}
              variant="outlined"
              size="small"
              color="secondary"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderLoadingSkeleton = () => {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
          Back
        </Button>

        <div style={{ display: 'flex', gap: '32px', flexDirection: 'column' }} className="responsive-flex">
          {/* Image Skeleton */}
          <div style={{ flex: '0 0 auto' }}>
            <Skeleton
              variant="rectangular"
              width={300}
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </div>

          {/* Content Skeleton */}
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2, width: '60%' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 3, width: '40%' }} />
            
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
            ))}
          </div>
        </div>
      </Container>
    );
  };

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
          Back
        </Button>
        
        <Alert
          severity="error"
          onClose={handleErrorClose}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Anime not found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The anime you're looking for could not be found.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!anime) {
    return null;
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f'
  };

  return (
    <div style={containerStyle}>
      {/* Animated Header */}
      <AnimatedHeader
        title={anime ? anime.title : 'Anime Details'}
        showSearch={false}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              Back to Search
            </Button>
          </motion.div>

          {/* Main Content */}
          <div style={{ display: 'flex', gap: '32px', flexDirection: 'column' }} className="main-content">
            {/* Anime Poster */}
            <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
              <img
                src={getImageUrl(anime)}
                alt={anime.title}
                style={{
                  width: '100%',
                  maxWidth: 300,
                  height: 'auto',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              />
            </div>

            {/* Anime Information */}
            <div style={{ flex: 1 }}>
              {/* Title */}
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                {anime.title}
              </Typography>

              {/* Alternative Titles */}
              {anime.title_english && anime.title_english !== anime.title && (
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {anime.title_english}
                </Typography>
              )}

              {anime.title_japanese && (
                <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                  {anime.title_japanese}
                </Typography>
              )}

              {/* Rating and Score */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                  <Rating
                    value={(anime.score || 0) / 2}
                    readOnly
                    precision={0.1}
                  />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {formatScore(anime.score)}
                  </Typography>
                </div>
                <Chip
                  icon={<StarIcon />}
                  label={`Rank #${anime.rank || 'N/A'}`}
                  color="primary"
                  variant="outlined"
                />
                {isFromCache && (
                  <Chip
                    icon={<SpeedIcon />}
                    label="Loaded from cache"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </div>

              {/* Quick Info Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 24 }}>
                <Chip
                  icon={anime.type === 'TV' ? <TvIcon /> : <MovieIcon />}
                  label={anime.type || 'Unknown'}
                  color="primary"
                />
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={anime.year || 'Unknown Year'}
                />
                <Chip
                  label={anime.status}
                  color={anime.airing ? 'success' : 'default'}
                />
                {anime.episodes && (
                  <Chip
                    label={`${anime.episodes} episodes`}
                  />
                )}
                {anime.rating && (
                  <Chip
                    label={anime.rating}
                    variant="outlined"
                  />
                )}
              </div>

              {/* Synopsis */}
              {anime.synopsis && (
                <div style={{ marginBottom: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Synopsis
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {anime.synopsis}
                  </Typography>
                </div>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Additional Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ flex: 1 }}>
                  {anime.aired && (
                    <div style={{ marginBottom: 16 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Aired
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(anime.aired.from)} - {anime.aired.to ? formatDate(anime.aired.to) : 'Ongoing'}
                      </Typography>
                    </div>
                  )}

                  {anime.source && (
                    <div style={{ marginBottom: 16 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Source
                      </Typography>
                      <Typography variant="body2">
                        {anime.source}
                      </Typography>
                    </div>
                  )}

                  {anime.duration && (
                    <div style={{ marginBottom: 16 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {anime.duration}
                      </Typography>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Popularity
                    </Typography>
                    <Typography variant="body2">
                      #{anime.popularity?.toLocaleString() || 'N/A'}
                    </Typography>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Members
                    </Typography>
                    <Typography variant="body2">
                      {anime.members?.toLocaleString() || 'N/A'}
                    </Typography>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Favorites
                    </Typography>
                    <Typography variant="body2">
                      {anime.favorites?.toLocaleString() || 'N/A'}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {renderGenres(anime)}

              {/* Studios */}
              {renderStudios(anime)}
            </div>
          </div>

          {/* Trailer */}
          {renderTrailer(anime)}

          {/* Background */}
          {anime.background && (
            <div style={{ marginTop: 32 }}>
              <Typography variant="h6" gutterBottom>
                Background
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {anime.background}
              </Typography>
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default DetailPage;
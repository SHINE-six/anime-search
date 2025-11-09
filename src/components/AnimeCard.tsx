import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Rating,
  Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/anime/${anime.mal_id}`);
  };

  const getImageUrl = () => {
    return anime.images?.jpg?.large_image_url || 
           anime.images?.jpg?.image_url || 
           'https://via.placeholder.com/300x400/e0e0e0/757575?text=No+Image';
  };

  const formatScore = (score: number | null) => {
    return score ? score.toFixed(1) : 'N/A';
  };

  const getYear = () => {
    if (anime.year) return anime.year;
    if (anime.aired?.from) {
      return new Date(anime.aired.from).getFullYear();
    }
    return 'Unknown';
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height="300"
        image={getImageUrl()}
        alt={anime.title}
        sx={{
          objectFit: 'cover',
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.5em',
          }}
        >
          {anime.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={(anime.score || 0) / 2} 
            readOnly 
            precision={0.1}
            size="small"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {formatScore(anime.score)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={anime.type || 'Unknown'} 
            size="small" 
            variant="outlined"
            color="primary"
          />
          <Chip 
            label={getYear()} 
            size="small" 
            variant="outlined"
          />
          {anime.status && (
            <Chip 
              label={anime.status} 
              size="small" 
              variant="outlined"
              color={anime.airing ? 'success' : 'default'}
            />
          )}
        </Box>

        {anime.episodes && (
          <Typography variant="body2" color="text.secondary">
            Episodes: {anime.episodes}
          </Typography>
        )}

        {anime.synopsis && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {anime.synopsis}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Skeleton loader for loading states
export const AnimeCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={300} />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
        <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
        </Box>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 1 }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
      </CardContent>
    </Card>
  );
};

export default AnimeCard;
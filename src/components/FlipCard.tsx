import React, { useState } from 'react';
import {
  Card,
//   CardMedia,
  CardContent,
  Typography,
  Chip,
  Rating,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FlipCardProps {
  anime: any;
  delay?: number;
}

const FlipCard: React.FC<FlipCardProps> = ({ anime, delay = 0 }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateY: 0,
      transition: { 
        duration: 0.1,
        delay,
        type: "spring" as const,
        stiffness: 100
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 5,
      transition: { duration: 0.4 }
    }
  };

  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.2 }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.2 }
    }
  };

  const genres = anime.genres?.slice(0, 3) || [];
  const score = anime.score || 0;

  const handleCardClick = () => {
    navigate(`/anime/${anime.mal_id}`);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ perspective: 1000 }}
    >
      <Card
        sx={{
          height: 400,
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }
        }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onClick={handleCardClick}
      >
        <AnimatePresence mode="wait">
          {(!isFlipped ? (
            // Front of card
            <motion.div
              key="front"
              variants={flipVariants}
              initial="front"
              animate="front"
              exit="back"
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden'
              }}
            >
              <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                alt={anime.title}
                style={{
                  height: 250,
                  width: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
              />
              
              <CardContent sx={{ height: 150, p: 2 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {anime.title}
                </Typography>

                <div style={{ marginBottom: 2 }}>
                  <Rating
                    value={score / 2}
                    precision={0.1}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {score.toFixed(1)}
                  </Typography>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {genres.map((genre: any) => (
                    <Chip
                      key={genre.mal_id}
                      label={genre.name}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'inherit',
                        fontSize: '0.7rem'
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </motion.div>
          ) : (
            // Back of card
            <motion.div
              key="back"
              variants={flipVariants}
              initial="back"
              animate="front"
              exit="back"
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.8) 0%, rgba(156, 39, 176, 0.8) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 3,
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {anime.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 3, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {anime.synopsis || 'No synopsis available.'}
                </Typography>

                <div style={{ display: 'flex', gap: 2 }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <IconButton 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <PlayIcon />
                    </IconButton>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <IconButton 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <IconButton 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )) as React.ReactNode}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};export default FlipCard;
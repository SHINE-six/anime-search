import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  ThreeDRotation as ThreeDIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

interface AnimatedHeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  is3DMode?: boolean;
  onToggle3DMode?: (enabled: boolean) => void;
  onOpenCacheManager?: () => void;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title = 'Anime Search',
  showSearch = true,
  onSearchClick,
  is3DMode = false,
  onToggle3DMode,
  onOpenCacheManager
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <motion.div
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <AppBar 
        position="sticky"
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.dark, 0.95)} 0%, 
            ${alpha(theme.palette.secondary.dark, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.dark, 0.3)}`
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important' }}>
          {/* Animated Logo */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginRight: 3
              }}
              onClick={() => navigate('/')}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 2,
                  position: 'relative'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  A
                </Typography>
              </div>
            </div>
          </motion.div>

          {/* Title with Gradient Text */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {title}
          </Typography>

          {/* Navigation Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {location.pathname !== '/' && (
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/')}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1)
                    }
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </motion.div>
            )}

            {showSearch && onSearchClick && (
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IconButton
                  color="inherit"
                  onClick={onSearchClick}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1)
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </motion.div>
            )}

            {/* 3D Mode Toggle */}
            {onToggle3DMode && (
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={is3DMode}
                      onChange={(e) => onToggle3DMode(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '0.875rem' }}>
                      <ThreeDIcon sx={{ mr: 0.5, fontSize: 18 }} />
                      3D
                    </div>
                  }
                  sx={{ 
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      marginLeft: '4px'
                    }
                  }}
                />
              </motion.div>
            )}

            {/* Cache Manager Button */}
            {onOpenCacheManager && (
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IconButton
                  color="inherit"
                  onClick={onOpenCacheManager}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1)
                    }
                  }}
                >
                  <StorageIcon />
                </IconButton>
              </motion.div>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
};

export default AnimatedHeader;
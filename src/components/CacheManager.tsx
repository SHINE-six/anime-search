import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Info as InfoIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import cacheService from '../services/cache';

interface CacheManagerProps {
  open: boolean;
  onClose: () => void;
}

const CacheManager: React.FC<CacheManagerProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [detailsCache, setDetailsCache] = useState<any[]>([]);
  const [searchCache, setSearchCache] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const refreshCache = () => {
    setDetailsCache(cacheService.getCachedDetails());
    setSearchCache(cacheService.getCachedSearches());
    setStats(cacheService.getCacheStats());
  };

  useEffect(() => {
    if (open) {
      refreshCache();
    }
  }, [open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClearAll = () => {
    cacheService.clearAllCache();
    refreshCache();
  };

  const handleRemoveDetails = (id: number) => {
    cacheService.removeDetailsFromCache(id);
    refreshCache();
  };

  const handleRemoveSearch = (query: string, page: number) => {
    cacheService.removeSearchFromCache(query, page);
    refreshCache();
  };

  const formatAge = (timestamp: number) => {
    const age = Date.now() - timestamp;
    const minutes = Math.floor(age / (1000 * 60));
    const seconds = Math.floor((age % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Cache Manager
          <Chip
            icon={<InfoIcon />}
            label={`${stats.detailsCount + stats.searchesCount} items • ${formatSize(stats.totalSize)}`}
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Anime Details (${detailsCache.length})`} />
            <Tab label={`Search Results (${searchCache.length})`} />
          </Tabs>
        </Box>

        {/* Anime Details Tab */}
        {tabValue === 0 && (
          <Box>
            {detailsCache.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <StorageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No anime details cached yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visit anime detail pages to see cached items here
                </Typography>
              </Box>
            ) : (
              <List>
                {detailsCache.map((entry, index) => (
                  <ListItem key={entry.data.mal_id} divider={index < detailsCache.length - 1}>
                    <ListItemText
                      primary={entry.data.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            ID: {entry.data.mal_id} • Cached: {formatAge(entry.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleRemoveDetails(entry.data.mal_id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Search Results Tab */}
        {tabValue === 1 && (
          <Box>
            {searchCache.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <StorageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No search results cached yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search for anime or browse top anime to see cached results here
                </Typography>
              </Box>
            ) : (
              <List>
                {searchCache.map((entry, index) => (
                  <ListItem key={`${entry.query}-${entry.page}`} divider={index < searchCache.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {entry.query === 'TOP_ANIME' ? (
                            <Chip label="Top Anime" color="primary" size="small" />
                          ) : (
                            <Typography variant="subtitle1">"{entry.query}"</Typography>
                          )}
                          <Chip label={`Page ${entry.page}`} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {entry.data.data.length} results • Cached: {formatAge(entry.timestamp)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleRemoveSearch(entry.query, entry.page)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClearAll}
          color="error" 
          startIcon={<DeleteIcon />}
          disabled={detailsCache.length === 0 && searchCache.length === 0}
        >
          Clear All Cache
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CacheManager;
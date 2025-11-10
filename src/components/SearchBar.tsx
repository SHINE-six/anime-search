import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  loading?: boolean;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onClear, 
  loading = false, 
  initialValue = '' 
}) => {
  const [query, setQuery] = useState(initialValue);
  const debouncedQuery = useDebounce(query, 250);

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery.trim());
    } else if (debouncedQuery === '') {
      onClear();
    }
  }, [debouncedQuery, onSearch, onClear]);

  // Update local state when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for anime..."
          value={query}
          onChange={handleInputChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClear}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </form>
    </div>
  );
};

export default SearchBar;
import React from 'react';
import { 
  Pagination,
  Typography,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { PaginationInfo } from '../types';

interface SearchPaginationProps {
  pagination: PaginationInfo | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const SearchPagination: React.FC<SearchPaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!pagination || pagination.last_visible_page <= 1) {
    return null;
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (value !== currentPage && !loading) {
      onPageChange(value);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        marginTop: 4,
        marginBottom: 2,
      }}
    >
      <Pagination
        count={pagination.last_visible_page}
        page={currentPage}
        onChange={handlePageChange}
        disabled={loading}
        color="primary"
        size={isMobile ? 'medium' : 'large'}
        siblingCount={isMobile ? 0 : 1}
        boundaryCount={isMobile ? 1 : 2}
        showFirstButton={!isMobile}
        showLastButton={!isMobile}
        sx={{
          '& .MuiPagination-ul': {
            flexWrap: 'wrap',
            justifyContent: 'center',
          },
        }}
      />
      
      {pagination.items && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          Showing {Math.min((currentPage - 1) * pagination.items.per_page + 1, pagination.items.total)} - {' '}
          {Math.min(currentPage * pagination.items.per_page, pagination.items.total)} of {' '}
          {pagination.items.total.toLocaleString()} results
        </Typography>
      )}
    </div>
  );
};

export default SearchPagination;
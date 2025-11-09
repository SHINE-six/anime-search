import React, { Component, ReactNode } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper 
} from '@mui/material';
import { RefreshRounded as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              We apologize for the inconvenience. Please try refreshing the page.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                textAlign: 'left',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <Typography variant="caption" color="error">
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              size="large"
              sx={{ mt: 3 }}
            >
              Refresh Page
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
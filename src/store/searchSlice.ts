import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SearchState, Anime, PaginationInfo } from '../types';
import apiService from '../services/api';

// Initial state
const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  pagination: null,
  currentPage: 1,
};

// Async thunk for searching anime
export const searchAnime = createAsyncThunk(
  'search/searchAnime',
  async ({ query, page }: { query: string; page: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.searchAnime(query, page);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Search failed');
    }
  }
);

// Async thunk for loading top anime
export const loadTopAnime = createAsyncThunk(
  'search/loadTopAnime',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await apiService.getTopAnime(page);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load top anime');
    }
  }
);

// Search slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      if (!action.payload.trim()) {
        state.results = [];
        state.error = null;
        state.pagination = null;
        state.currentPage = 1;
      }
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
      state.pagination = null;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search anime cases
      .addCase(searchAnime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAnime.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchAnime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.results = [];
        state.pagination = null;
      })
      // Load top anime cases
      .addCase(loadTopAnime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTopAnime.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
        state.query = ''; // Clear query when showing top anime
      })
      .addCase(loadTopAnime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.results = [];
        state.pagination = null;
      });
  },
});

export const { setQuery, clearSearch, setCurrentPage, clearError } = searchSlice.actions;
export default searchSlice.reducer;
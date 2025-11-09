import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AnimeDetailsState } from '../types';
import apiService from '../services/api';

// Initial state
const initialState: AnimeDetailsState = {
  anime: null,
  loading: false,
  error: null,
};

// Async thunk for fetching anime details with cache support
export const fetchAnimeDetails = createAsyncThunk(
  'animeDetails/fetchAnimeDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      console.debug('[redux] Fetching anime details for ID', id);
      const response = await apiService.getAnimeDetails(id);
      console.debug('[redux] Successfully fetched anime details', { 
        id, 
        title: response.data.title,
        fromCache: false // API service logs will show if it was from cache
      });
      return response.data;
    } catch (error) {
      console.error('[redux] Failed to fetch anime details', { id, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch anime details');
    }
  }
);

// Anime details slice
const animeDetailsSlice = createSlice({
  name: 'animeDetails',
  initialState,
  reducers: {
    clearAnimeDetails: (state) => {
      state.anime = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnimeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnimeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.anime = action.payload;
        state.error = null;
      })
      .addCase(fetchAnimeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.anime = null;
      });
  },
});

export const { clearAnimeDetails, clearError } = animeDetailsSlice.actions;
export default animeDetailsSlice.reducer;
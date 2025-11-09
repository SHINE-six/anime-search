// Base interfaces for Jikan API responses
export interface Image {
  image_url: string;
  small_image_url: string;
  medium_image_url: string;
  large_image_url: string;
  maximum_image_url: string;
}

export interface Images {
  jpg: Image;
  webp: Image;
}

export interface Genre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Studio {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Producer {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Licensors {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Trailer {
  youtube_id: string | null;
  url: string | null;
  embed_url: string | null;
}

export interface Aired {
  from: string | null;
  to: string | null;
  prop: {
    from: {
      day: number | null;
      month: number | null;
      year: number | null;
    };
    to: {
      day: number | null;
      month: number | null;
      year: number | null;
    };
    string: string;
  };
}

// Main Anime interface
export interface Anime {
  mal_id: number;
  url: string;
  images: Images;
  trailer: Trailer;
  approved: boolean;
  titles: Array<{
    type: string;
    title: string;
  }>;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: Aired;
  duration: string;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number;
  favorites: number;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  producers: Producer[];
  licensors: Licensors[];
  studios: Studio[];
  genres: Genre[];
  explicit_genres: Genre[];
  themes: Genre[];
  demographics: Genre[];
}

// API Response interfaces
export interface PaginationInfo {
  last_visible_page: number;
  has_next_page: boolean;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface AnimeSearchResponse {
  data: Anime[];
  pagination: PaginationInfo;
}

export interface AnimeDetailsResponse {
  data: Anime;
}

// Application State interfaces
export interface SearchState {
  query: string;
  results: Anime[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  currentPage: number;
}

export interface AnimeDetailsState {
  anime: Anime | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  search: SearchState;
  animeDetails: AnimeDetailsState;
}
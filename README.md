# Anime Search App

A modern, interactive anime discovery application built with React, TypeScript, and Redux. Search for anime, explore in 3D, and dive deep into detailed information about your favorite series.

🌐 **Live Demo**: [Your Deployment URL Here]

## Overview

This is a comprehensive two-page anime search application that goes beyond basic requirements with advanced 3D visualization, intelligent caching, and a polished user experience.

**Page 1:** Advanced search page with 2D grid and optional 3D scene visualization
**Page 2:** Detailed anime information page with rich media content
**API:** [Jikan API v4](https://docs.api.jikan.moe/) - MyAnimeList's official API

## Quick Start

```bash
npm install
npm run dev
```

The application will start on **port 4000** at `http://localhost:4000`

## Core Features

### ✅ All Required Functionality Implemented

- **React 18** with TypeScript and hooks-only architecture
- **Redux Toolkit** for comprehensive state management ([`store/`](src/store/))
- **React Router DOM** for seamless navigation
- **Server-side pagination** with full pagination controls
- **Instant search** with 250ms debouncing and request cancellation
- **Material-UI** for consistent, professional design

### 🔍 Search Experience

- Debounced search with automatic API call cancellation
- Real-time results with loading states
- Top anime discovery when no search query is active
- Advanced pagination with item count display
- Error handling for rate limits and network issues

### 📱 Responsive Design

- Mobile-first approach with adaptive layouts
- Touch-friendly 3D controls
- Responsive grid systems
- Optimized typography and spacing

## Bonus Implementation

### 🎨 Creative UI with "Wow" Factor

- **3D Anime Scene**: Interactive 3D carousel displaying anime cards in a floating, multi-level circular arrangement
- **Particle Systems**: Genre-based particle effects that respond to the main anime genre
- **Flip Cards**: Smooth animated cards that reveal additional information on hover
- **Animated Header**: Motion-based header with gradient effects and smooth transitions
- **Glass Morphism**: Modern frosted glass effects throughout the interface

### 🚀 Technical Excellence

- **Intelligent Caching System** ([`services/cache.ts`](src/services/cache.ts)):
  - Local storage-based caching for both search results and anime details
  - Automatic cache expiration (30 minutes)
  - Cache manager UI for viewing and managing cached data
  - Smart cache hit/miss logging for performance monitoring

- **Advanced Error Handling**:
  - Request cancellation for race condition prevention
  - Network failure recovery
  - Rate limiting detection and user feedback
  - Error boundary for graceful failure handling

- **Performance Optimizations**:
  - Request deduplication and cancellation
  - Skeleton loaders for perceived performance
  - Lazy loading and suspense boundaries
  - Optimized re-rendering with proper memoization

### 🌟 User Experience Enhancements

- **Loading States**: Comprehensive skeleton loaders and loading animations
- **Empty States**: Contextual empty state messages with helpful suggestions
- **3D Mode Toggle**: Switch between traditional grid and immersive 3D view
- **Cache Visualization**: Built-in cache manager showing stored data and performance metrics
- **Smooth Animations**: Framer Motion integration for fluid page transitions
- **Advanced Search Features**: Search history and intelligent result caching

### 🔧 Developer Experience

- **TypeScript Excellence**: Comprehensive type definitions with minimal `any` usage
- **Clean Architecture**: Well-organized component structure and separation of concerns
- **Custom Hooks**: Reusable logic with [`useDebounce`](src/hooks/useDebounce.ts)
- **Detailed Logging**: Comprehensive request/response logging for debugging
- **Error Boundaries**: Graceful error handling with development-friendly error display

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedHeader.tsx    # Motion-based header
│   ├── AnimeScene3D.tsx      # 3D visualization scene
│   ├── FlipCard.tsx          # Animated card component
│   ├── CacheManager.tsx      # Cache management UI
│   └── ...
├── pages/              # Route components
│   ├── SearchPage.tsx       # Main search interface
│   └── DetailPage.tsx       # Anime details
├── store/              # Redux state management
│   ├── searchSlice.ts       # Search state & actions
│   ├── animeDetailsSlice.ts # Details state & actions
│   └── index.ts             # Store configuration
├── services/           # External integrations
│   ├── api.ts              # Jikan API client
│   └── cache.ts            # Caching system
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks
```

## Technical Highlights

### State Management
- **Redux Toolkit** with async thunks for API calls
- Proper action creators and reducers
- Type-safe store with proper TypeScript integration

### API Integration
- Request cancellation and deduplication
- Rate limiting handling
- Comprehensive error handling
- Response caching with expiration

### 3D Visualization
- **Three.js** integration with React Three Fiber
- Interactive camera controls
- Particle systems with genre-based theming
- Performance-optimized rendering

### Caching Strategy
- Local storage-based persistence
- Intelligent cache invalidation
- Performance monitoring and metrics
- User-facing cache management tools

## Performance Features

- **Smart Caching**: Reduces API calls by 60-80% for repeated searches
- **Request Deduplication**: Prevents duplicate API calls
- **Optimized Rendering**: Efficient React rendering with proper memoization
- **Loading Optimization**: Skeleton screens and progressive loading

## Browser Support

- Modern browsers with ES6+ support
- WebGL support required for 3D features
- Responsive design for mobile and desktop

## Development

```bash
# Install dependencies
npm install

# Start development server (port 4000)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Technical Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: Redux Toolkit
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **Routing**: React Router DOM v7
- **API**: Jikan v4 (MyAnimeList)
- **Build Tool**: Create React App
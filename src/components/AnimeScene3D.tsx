import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CircularProgress } from '@mui/material';
// @ts-ignore
import * as THREE from 'three';
import Simple3DCard from './Simple3DCard';
import ParticleSystem from './ParticleSystem';
import cacheService from '../services/cache';

interface AnimeScene3DProps {
  animeList: any[]; // Still accept this for compatibility, but we'll use cached data
  onAnimeClick: (anime: any) => void;
  mainGenre?: string;
}

// Scene click handler component for proper raycasting
const SceneClickHandler: React.FC<{ 
  animeList: any[], 
  onAnimeClick: (anime: any) => void 
}> = ({ animeList, onAnimeClick }) => {
  const { camera, scene, raycaster, pointer, gl } = useThree();

  const handleClick = useCallback((event: MouseEvent) => {
    // Calculate mouse position in normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster with camera and mouse position
    raycaster.setFromCamera(pointer, camera);

    // Get all meshes from the scene that have anime data
    const intersectableObjects: THREE.Object3D[] = [];
    interface AnimeDataMesh extends THREE.Mesh {
      animeData: any;
    }

    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && (child as AnimeDataMesh).animeData) {
        intersectableObjects.push(child);
      }
    });

    // Find intersections
    const intersects = raycaster.intersectObjects(intersectableObjects, false);
    
    if (intersects.length > 0) {
      // Get the closest intersection (first in the array is closest)
      const closestIntersection = intersects[0];
      const animeData = (closestIntersection.object as any).animeData;
      
      if (animeData) {
        onAnimeClick(animeData);
      }
    }
  }, [camera, scene, raycaster, pointer, gl, onAnimeClick]);

  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [handleClick, gl.domElement]);

  return null; // This component doesn't render anything
};

const AnimeScene3D: React.FC<AnimeScene3DProps> = ({ 
  animeList, // We'll use this as a trigger to refresh cache
  onAnimeClick, 
  mainGenre = 'default' 
}) => {
  const [cachedAnime, setCachedAnime] = useState<any[]>([]);

  // Update cached anime whenever animeList changes (indicating new data was loaded)
  useEffect(() => {
    const allCachedAnime = cacheService.getAllCachedAnimeWithPageInfo();
    setCachedAnime(allCachedAnime);
  }, [animeList]); // Refresh when animeList changes

  // Create positions for cards in multi-level circular carousel
  const displayAnime = cachedAnime.slice(0, 60); // Display up to 60 cards (3 levels max)
  const cardPositions = displayAnime.map((_, index) => {
    const cardsPerLevel = 30; // 20 cards per circular level
    const level = Math.floor(index / cardsPerLevel); // Which vertical level (0, 1, 2...)
    const indexInLevel = index % cardsPerLevel; // Position within that level
    
    const angleStep = (Math.PI * 2) / cardsPerLevel;
    const angle = indexInLevel * angleStep;
    const radius = 10; // Fixed radius for all levels
    const levelHeight = 3.5; // Vertical spacing between levels
    const height = level * levelHeight - (Math.floor((displayAnime.length - 1) / cardsPerLevel) * levelHeight / 2); // Center the levels vertically
    
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ] as [number, number, number];
  });

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '700px',
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  };

  return (
    <div style={containerStyle}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[15, 4, 15]} />
        <OrbitControls 
          target={[0, 0, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={12}
          maxDistance={25}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
          autoRotate={false}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a90e2" />
        
        <Suspense fallback={null}>
          {/* Scene Click Handler */}
          <SceneClickHandler animeList={displayAnime} onAnimeClick={onAnimeClick} />
          
          {/* Particle System */}
          <ParticleSystem count={5000} genre={mainGenre} />
          
          {/* Floating Cards */}
          {displayAnime.map((anime, index) => (
            <Simple3DCard
              key={anime.mal_id}
              position={cardPositions[index]}
              imageUrl={anime.images?.jpg?.image_url || ''}
              anime={anime}
              pageInfo={anime.pageInfo}
            />
          ))}
        </Suspense>
      </Canvas>
      
      {/* Loading overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1,
          opacity: animeList.length === 0 ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: animeList.length === 0 ? 'auto' : 'none'
        }}
      >
        <CircularProgress size={60} />
      </div>
    </div>
  );
};

export default AnimeScene3D;
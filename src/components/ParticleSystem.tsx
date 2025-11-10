import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
// @ts-ignore
import * as THREE from 'three';

interface ParticleSystemProps {
  count: number;
  genre: string;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ count, genre }) => {
  const mesh = useRef<THREE.Points>(null!);
  
  // Generate particle positions based on genre
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Genre-specific color schemes
    const genreColors = {
      'Action': [1, 0.2, 0.2], // Red
      'Romance': [1, 0.7, 0.8], // Pink
      'Comedy': [1, 1, 0.2], // Yellow
      'Drama': [0.5, 0.2, 0.8], // Purple
      'Fantasy': [0.2, 0.8, 1], // Blue
      'Sci-Fi': [0.2, 1, 0.2], // Green
      'Horror': [0.3, 0.1, 0.3], // Dark Purple
      'Slice of Life': [0.9, 0.9, 0.7], // Cream
      'default': [1, 1, 1] // White
    };
    
    const color = genreColors[genre as keyof typeof genreColors] || genreColors.default;
    
    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      // Color with slight variation
      colors[i * 3] = color[0] + (Math.random() - 0.5) * 0.3;
      colors[i * 3 + 1] = color[1] + (Math.random() - 0.5) * 0.3;
      colors[i * 3 + 2] = color[2] + (Math.random() - 0.5) * 0.3;
    }
    
    return { positions, colors };
  }, [count, genre]);

  // Animate particles
  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle floating motion
      mesh.current.rotation.x = time * 0.1;
      mesh.current.rotation.y = time * 0.05;
      
      // Move particles based on genre
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        if (genre === 'Romance') {
          // Heart-like floating for romance
          positions[i3 + 1] += Math.sin(time * 2 + positions[i3]) * 0.01;
        } else if (genre === 'Action') {
          // Faster, more energetic movement
          positions[i3] += Math.sin(time * 3 + i) * 0.02;
          positions[i3 + 2] += Math.cos(time * 3 + i) * 0.02;
        } else {
          // Default gentle floating
          positions[i3 + 1] += Math.sin(time + i) * 0.005;
        }
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        alphaTest={0.1}
      />
    </points>
  );
};

export default ParticleSystem;
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring } from '@react-spring/web';
import * as THREE from 'three';

interface FloatingCardProps {
  position: [number, number, number];
  imageUrl: string;
  anime: any;
  onClick: () => void;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ 
  position, 
  imageUrl, 
  anime, 
  onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Create floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Spring animation for hover effects
  const [springs, api] = useSpring(() => ({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
  }));

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imageUrl);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={springs.scale as any}
      rotation={springs.rotation as any}
      onClick={onClick}
      onPointerEnter={() => {
        api.start({ scale: [1.1, 1.1, 1.1], rotation: [0, 0.2, 0] });
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        api.start({ scale: [1, 1, 1], rotation: [0, 0, 0] });
        document.body.style.cursor = 'auto';
      }}
    >
      <planeGeometry args={[2, 3]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export default FloatingCard;
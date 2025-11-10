import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
// @ts-ignore
import * as THREE from 'three';

interface Simple3DCardProps {
  position: [number, number, number];
  imageUrl: string;
  anime: any;
  pageInfo?: { query: string, page: number };
}

const Simple3DCard: React.FC<Simple3DCardProps> = ({ 
  position, 
  imageUrl, 
  anime, 
  pageInfo
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const mainMeshRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  
  // Attach anime data to the main mesh for raycasting
  React.useEffect(() => {
    if (mainMeshRef.current) {
      (mainMeshRef.current as any).animeData = anime;
    }
  }, [anime]);
  
  // Create floating animation and make card always face camera
  useFrame((state) => {
    if (groupRef.current) {
      // Update floating position
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Make the card always face the camera
      groupRef.current.lookAt(camera.position);
    }
  });

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(imageUrl);

  // Generate border color based on page number
  const getBorderColor = (page: number): string => {
    const colors = [
      '#ff6b6b', // Red
      '#4ecdc4', // Teal
      '#45b7d1', // Blue
      '#96ceb4', // Green
      '#feca57', // Yellow
      '#ff9ff3', // Pink
      '#54a0ff', // Light Blue
      '#5f27cd', // Purple
      '#00d2d3', // Cyan
      '#ff9f43', // Orange
    ];
    return colors[page % colors.length];
  };

  const borderColor = pageInfo ? getBorderColor(pageInfo.page) : '#ffffff';

  return (
    <group ref={groupRef} position={position}>
      {/* Main card */}
      <mesh
        ref={mainMeshRef}
        onPointerEnter={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Border frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.1, 3.1]} />
        <meshBasicMaterial color={borderColor} />
      </mesh>
      
      {/* Page number indicator */}
      {pageInfo && (
        <>
          <mesh position={[0.7, -1.3, 0.01]}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial color={borderColor} />
          </mesh>
          <Text
            position={[0.7, -1.3, 0.02]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {pageInfo.page}
          </Text>
        </>
      )}
    </group>
  );
};

export default Simple3DCard;
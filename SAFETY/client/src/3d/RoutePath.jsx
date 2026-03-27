import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const RoutePath = ({ points, center }) => {
  const [cx, cy] = center;
  const meshRef = useRef();

  const curve = useMemo(() => {
    if (!points || points.length < 2) return null;
    
    const worldPoints = points.map(p => {
       const x = (p[0] - cx) * 111320 * Math.cos(cy * Math.PI / 180);
       const y = 0.5; // Slightly above ground
       const z = (p[1] - cy) * 111320 * -1; // Invert lat for Z-axis
       return new THREE.Vector3(x, y, z);
    });

    return new THREE.CatmullRomCurve3(worldPoints);
  }, [points, center]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
  });

  if (!curve) return null;

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 40, 0.5, 6, false]} />
      <meshStandardMaterial color="#3B82F6" emissive="#2563EB" emissiveIntensity={2} transparent opacity={0.8} />
    </mesh>
  );
};

export default RoutePath;

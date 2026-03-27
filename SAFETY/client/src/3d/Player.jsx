import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Player = ({ routePoints, center, followMode }) => {
  const meshRef = useRef();
  const [cx, cy] = center;

  const curve = useMemo(() => {
    if (!routePoints || routePoints.length < 2) return null;
    const worldPoints = routePoints.map(p => {
       const x = (p[0] - cx) * 111320 * Math.cos(cy * Math.PI / 180);
       const y = 1.2; 
       const z = (p[1] - cy) * 111320 * -1;
       return new THREE.Vector3(x, y, z);
    });
    return new THREE.CatmullRomCurve3(worldPoints);
  }, [routePoints, center]);

  useFrame((state) => {
    if (!curve || !meshRef.current) return;
    
    // Animate along path
    const t = (state.clock.elapsedTime * 0.05) % 1;
    const point = curve.getPointAt(t);
    const nextPoint = curve.getPointAt((t + 0.01) % 1);
    
    meshRef.current.position.copy(point);
    meshRef.current.lookAt(nextPoint);
    
    // Pulse animation
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.1;

    // Follow Mode: Camera transition
    if (followMode) {
      const cameraOffset = new THREE.Vector3(0, 50, 80).applyQuaternion(meshRef.current.quaternion);
      state.camera.position.lerp(point.clone().add(cameraOffset), 0.1);
      state.camera.lookAt(point);
    }
  });

  if (!curve) return null;

  return (
    <group ref={meshRef}>
       <mesh castShadow>
          <boxGeometry args={[1.5, 0.8, 3]} />
          <meshStandardMaterial color="#2563EB" emissive="#1D4ED8" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
       </mesh>
       <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[1.4, 0.1, 2.8]} />
          <meshStandardMaterial color="black" />
       </mesh>
       <mesh position={[0, 0, 1.6]}>
          <coneGeometry args={[0.3, 0.8, 4]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
       </mesh>
    </group>
  );
};

export default Player;

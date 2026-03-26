import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Text, MeshDistortMaterial, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { MOCK_ROUTES, RISK_ZONES } from '../data/mockData';

const Building = ({ position, args, type = 0 }) => {
  const meshRef = useRef();
  
  // Create a grid material for windows
  const windowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.1,
    metalness: 0.8,
    emissive: "#10b981",
    emissiveIntensity: type % 5 === 0 ? 0.5 : 0.05
  }), [type]);

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Decorative windows overlay */}
      <mesh scale={[1.01, 0.9, 1.01]}>
         <boxGeometry args={args} />
         <meshStandardMaterial 
           color="#111" 
           wireframe 
           transparent 
           opacity={0.1}
         />
      </mesh>
    </group>
  );
};

const UserVehicle = ({ path, color }) => {
  const groupRef = useRef();
  const speed = 0.05;
  
  const points = useMemo(() => 
    path.map(p => new THREE.Vector3((p[0] - 77.5946) * 1000, 1.2, (p[1] - 12.9716) * 1000)),
    [path]
  );

  useFrame((state) => {
    const time = (state.clock.getElapsedTime() * speed) % 1;
    const index = Math.floor(time * (points.length - 1));
    const nextIndex = (index + 1) % points.length;
    const alpha = (time * (points.length - 1)) % 1;
    
    if (groupRef.current) {
      groupRef.current.position.lerpVectors(points[index], points[nextIndex], alpha);
      groupRef.current.lookAt(points[nextIndex]);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Vehicle Body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.8, 3]} />
        <meshStandardMaterial color={color} metalness={0.8} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0.5, 0, 1.6]}>
         <sphereGeometry args={[0.2]} />
         <meshStandardMaterial emissive="white" emissiveIntensity={5} />
         <pointLight color="white" intensity={2} distance={10} />
      </mesh>
      <mesh position={[-0.5, 0, 1.6]}>
         <sphereGeometry args={[0.2]} />
         <meshStandardMaterial emissive="white" emissiveIntensity={5} />
      </mesh>
      {/* Glow trail */}
      <mesh position={[0, -0.6, 0]}>
         <planeGeometry args={[2, 4]} />
         <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} />
      </mesh>
    </group>
  );
};

const RiskZone = ({ position, color, intensity }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
  });

  return (
    <mesh position={position} ref={meshRef}>
      <sphereGeometry args={[intensity * 3, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.3} 
        emissive={color}
        emissiveIntensity={1}
      />
    </mesh>
  );
};

const ReportMarker = ({ position }) => {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.rotation.y += 0.05;
    meshRef.current.position.y = 2 + Math.sin(state.clock.getElapsedTime() * 5) * 0.5;
  });
  return (
    <mesh position={position} ref={meshRef}>
       <octahedronGeometry args={[1, 0]} />
       <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
    </mesh>
  );
}

const RouteLine = ({ path, color }) => {
  const points = useMemo(() => 
    path.map(p => new THREE.Vector3((p[0] - 77.5946) * 1000, 0.1, (p[1] - 12.9716) * 1000)),
    [path]
  );
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={5} />
    </line>
  );
};

const MovingMarker = ({ path, color }) => {
  const markerRef = useRef();
  const speed = 0.05;
  
  const points = useMemo(() => 
    path.map(p => new THREE.Vector3((p[0] - 77.5946) * 1000, 1, (p[1] - 12.9716) * 1000)),
    [path]
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * speed % 1;
    const index = Math.floor(time * (points.length - 1));
    const nextIndex = (index + 1) % points.length;
    const alpha = (time * (points.length - 1)) % 1;
    
    if (markerRef.current) {
      markerRef.current.position.lerpVectors(points[index], points[nextIndex], alpha);
    }
  });

  return (
    <mesh ref={markerRef}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      <pointLight color={color} intensity={2} distance={5} />
    </mesh>
  );
};

const ThreeDView = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/reports')
      .then(res => res.json())
      .then(setReports)
      .catch(() => {});
  }, []);

  return (
    <div className="w-full h-full gradient-bg overflow-hidden relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[50, 50, 50]} fov={60} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            maxPolarAngle={Math.PI / 2.1}
            minDistance={10}
            maxDistance={150}
          />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />

          <Environment preset="city" />

          {/* Grid/Ground (Midnight theme) */}
          <gridHelper args={[1000, 100, 0x1E293B, 0x0F172A]} position={[0, -0.1, 0]} />
          
          <ContactShadows opacity={0.4} scale={100} blur={2.4} far={10} />

          {/* Render Buildings */}
          {Array.from({ length: 80 }).map((_, i) => (
            <Building 
              key={i}
              type={i}
              position={[
                (Math.random() - 0.5) * 400, 
                0,
                (Math.random() - 0.5) * 400
              ]}
              args={[10 + Math.random() * 15, 20 + Math.random() * 60, 10 + Math.random() * 15]}
            />
          ))}

          {/* Render Routes */}
          {MOCK_ROUTES.map((route) => (
            <React.Fragment key={route.id}>
              <RouteLine 
                path={route.path} 
                color={route.type === 'safe' ? '#10b981' : '#3b82f6'} 
              />
              <UserVehicle 
                path={route.path} 
                color={route.type === 'safe' ? '#10b981' : '#3b82f6'} 
              />
            </React.Fragment>
          ))}

          {/* Render Community Reports */}
          {reports.map((report) => (
            <ReportMarker 
              key={report._id}
              position={[
                (report.location.lng - 77.5946) * 1000,
                0,
                (report.location.lat - 12.9716) * 1000
              ]}
            />
          ))}

          {/* Highlight Risk Zones */}
          {RISK_ZONES.map((zone) => (
            <RiskZone 
              key={zone.id}
              position={[
                (zone.center[0] - 77.5946) * 1000, 
                0, 
                (zone.center[1] - 12.9716) * 1000
              ]}
              color={zone.type === 'high-crime' ? '#ef4444' : '#f59e0b'}
              intensity={zone.intensity}
            />
          ))}

          {/* 3D Labeling using Text */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Text
              position={[0, 40, 0]}
              color="white"
              fontSize={4}
              maxWidth={100}
              lineHeight={1}
              letterSpacing={0.02}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
            >
              SafeRoute 3D Engine
              <meshStandardMaterial attach="material" color="white" emissive="#10b981" />
            </Text>
          </Float>

        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-6 left-6 glass rounded-2xl p-4 pointer-events-none">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-2">Live 3D Visualization</h3>
        <p className="text-xs text-zinc-400">Rendering real-time traffic & safety metrics</p>
      </div>
    </div>
  );
};

export default ThreeDView;

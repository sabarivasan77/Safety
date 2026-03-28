import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Sky, Environment, Float, Line, Circle } from '@react-three/drei';
import * as THREE from 'three';

const Pathline = ({ segments }) => {
  const points = useMemo(() => segments.map((p) => new THREE.Vector3(p[0], 0.1, p[1])), [segments]);
  return (
    <>
      <Line points={points} color="#2563EB" lineWidth={10} dashed={false} />
      {/* Path Glow */}
      <Line points={points} color="#60A5FA" lineWidth={2} opacity={0.5} transparent />
    </>
  );
};

const Building = ({ position, height, width, color = "#E2E8F0" }) => {
  return (
    <mesh position={[position[0], height / 2, position[1]]}>
      <boxGeometry args={[width, height, width]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
};

const CityGrid = ({ center = [0, 0] }) => {
  const buildings = useMemo(() => {
    const res = [];
    const gridSize = 10;
    const spacing = 1.2;
    for (let x = -gridSize; x < gridSize; x++) {
      for (let z = -gridSize; z < gridSize; z++) {
        // Random buildings, leaving space for "streets"
        if (Math.random() > 0.4) {
          res.push({
            id: `${x}-${z}`,
            pos: [x * spacing + center[0], z * spacing + center[1]],
            h: Math.random() * 3 + 1,
            w: 0.8,
            color: Math.random() > 0.8 ? "#93C5FD" : "#CBD5E1"
          });
        }
      }
    }
    return res;
  }, [center]);

  return (
    <group>
      {buildings.map((b) => (
        <Building key={b.id} position={b.pos} height={b.h} width={b.w} color={b.color} />
      ))}
    </group>
  );
};

const SafetyZone = ({ position, intensity }) => {
  return (
    <group position={[position[0], 0.05, position[1]]}>
       <Circle args={[0.5, 32]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={intensity > 7 ? "#EF4444" : "#F59E0B"} transparent opacity={0.3} />
       </Circle>
       <pointLight color={intensity > 7 ? "red" : "orange"} intensity={1} distance={2} />
    </group>
  );
};

const ThreeDView = ({ routes, activeRouteId, reports }) => {
  const activeRoute = routes?.find(r => r.id === activeRouteId) || routes?.[0];

  // Logic to center the 3D world around the route
  const centeredPath = useMemo(() => {
    if (!activeRoute) return [];
    const coords = activeRoute.geometry.coordinates;
    const startLng = coords[0][0];
    const startLat = coords[0][1];
    
    // Scale longitude and latitude to meters-ish for 3D visualization
    return coords.map(c => [
       (c[0] - startLng) * 10000, 
       (c[1] - startLat) * 10000
    ]);
  }, [activeRoute]);

  const reportPositions = useMemo(() => {
    if (!activeRoute || !reports) return [];
    const startLng = activeRoute.geometry.coordinates[0][0];
    const startLat = activeRoute.geometry.coordinates[0][1];
    
    return reports.map(r => ({
      pos: [(r.location.lng - startLng) * 10000, (r.location.lat - startLat) * 10000],
      intensity: r.severity || 5
    }));
  }, [activeRoute, reports]);

  return (
    <div className="w-full h-full bg-[#f8fafc] rounded-3xl overflow-hidden shadow-2xl relative">
       {/* 3D UI Overlay */}
       <div className="absolute top-6 right-6 z-10">
          <div className="bg-slate-900/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-900/5 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Procedural 3D Active</span>
          </div>
       </div>

      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        <OrbitControls 
          enableDamping={true} 
          dampingFactor={0.05}
          maxDistance={50}
          minDistance={1}
          maxPolarAngle={Math.PI / 2.1} 
        />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <group>
            {/* Ground Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
            </mesh>
            
            <gridHelper args={[100, 50, "#CBD5E1", "#E2E8F0"]} />

            <CityGrid />

            {centeredPath.length > 0 && <Pathline segments={centeredPath} />}
            
            {reportPositions.map((r, i) => (
               <SafetyZone key={i} position={r.pos} intensity={r.intensity} />
            ))}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeDView;

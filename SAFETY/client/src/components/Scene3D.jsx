import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Stars, Float, Text, Trail, Sparkles, SpotLight, useDepthBuffer, PresentationControls } from '@react-three/drei';
import { useUser } from '../context/UserContext';
import { osmService } from '../services/osmService';
import * as THREE from 'three';

// --- GIS Scaling ---
const COORDINATE_OFFSET = { lat: 13.0827, lng: 80.2707 };
const toLocal = (lat, lng) => {
  if (!lat || !lng) return { x: 0, z: 0 };
  return {
    x: (lng - COORDINATE_OFFSET.lng) * 111320 * Math.cos(lat * Math.PI / 180),
    z: (lat - COORDINATE_OFFSET.lat) * -111320
  };
};

// --- People Light Cluster (Crowd Simulation) ---
const PeopleCluster = ({ center, count = 20, radius = 40, color = "#60a5fa" }) => {
  const points = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * radius,
        0,
        (Math.random() - 0.5) * radius
      ),
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    }));
  }, [count, radius]);

  return (
    <group position={[center.x, 0, center.z]}>
      {points.map((p, i) => (
         <MovingPerson key={i} p={p} color={color} />
      ))}
    </group>
  );
};

const MovingPerson = ({ p, color }) => {
  const ref = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.position.x = p.offset.x + Math.sin(time * p.speed + p.phase) * 2;
    ref.current.position.z = p.offset.z + Math.cos(time * p.speed + p.phase) * 2;
    ref.current.position.y = 0.5 + Math.abs(Math.sin(time * 5 + p.phase)) * 0.2; // Slight bounce
  });
  return (
    <mesh ref={ref}>
       <sphereGeometry args={[0.25, 8, 8]} />
       <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
       <pointLight distance={5} intensity={1} color={color} />
    </mesh>
  );
};

const RealBuilding = ({ coords, height, type }) => {
  const shape = useMemo(() => {
    if (!coords || coords.length < 3) return null;
    const s = new THREE.Shape();
    const start = toLocal(coords[0][1], coords[0][0]);
    s.moveTo(start.x, start.z);
    coords.slice(1).forEach(c => {
      const p = toLocal(c[1], c[0]);
      s.lineTo(p.x, p.z);
    });
    return s;
  }, [coords]);

  if (!shape) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height / 2, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, { depth: height, bevelEnabled: false }]} />
      <meshStandardMaterial 
        color={type === 'emergency' ? '#ef4444' : '#1e293b'} 
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
};

const LiveEntity = ({ pos, color, label }) => {
  const ref = useRef();
  useFrame((state) => {
    ref.current.position.y = 4 + Math.sin(state.clock.getElapsedTime() * 2) * 0.5;
    ref.current.rotation.y += 0.04;
  });
  return (
    <group position={[pos.x, 0, pos.z]}>
      <mesh ref={ref} castShadow>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Text position={[0, 7, 0]} fontSize={1.4} color="white" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.ttf">
        {label}
      </Text>
    </group>
  );
};

const FocusCamera = ({ target }) => {
  const { camera } = useThree();
  useFrame(() => {
    if (target) {
      const ideal = new THREE.Vector3(target.x + 60, 70, target.z + 60);
      camera.position.lerp(ideal, 0.03);
      camera.lookAt(target.x, 0, target.z);
    }
  });
  return null;
};

const Scene3D = () => {
  const { userState } = useUser();
  const [osmData, setOsmData] = useState({ buildings: [], roads: [] });
  const [loading, setLoading] = useState(true);

  const userLocal = useMemo(() => toLocal(userState.currentLocation.lat, userState.currentLocation.lng), [userState.currentLocation]);

  useEffect(() => {
    let active = true;
    const fetchOSM = async () => {
      try {
        setLoading(true);
        // Radius increased to 1000m for "MORE BUILDINGS"
        const data = await osmService.getBuildings(userState.currentLocation.lat, userState.currentLocation.lng, 1000);
        if (active) {
          setOsmData(data);
          setLoading(false);
        }
      } catch (e) {
        if (active) setLoading(false);
      }
    };
    fetchOSM();
    return () => { active = false; };
  }, [userState.currentLocation.lat, userState.currentLocation.lng]);

  const entities = useMemo(() => [
    { id: 'p1', type: 'POLICE PATROL', color: '#3b82f6', pos: { x: userLocal.x + 80, z: userLocal.z - 40 } },
    { id: 'r1', type: 'FAMILY TRACKER', color: '#f43f5e', pos: { x: userLocal.x - 60, z: userLocal.z + 50 } },
    { id: 'r2', type: 'RELATIVE', color: '#10b981', pos: { x: userLocal.x + 30, z: userLocal.z + 90 } }
  ], [userLocal]);

  return (
    <div className="w-full h-full glass rounded-3xl overflow-hidden premium-shadow bg-slate-950 border border-white/5">
      <Canvas shadows camera={{ position: [150, 150, 150], fov: 45 }}>
        <FocusCamera target={userLocal} />
        <color attach="background" args={['#020617']} />
        <Stars radius={120} depth={60} count={6000} factor={6} saturation={0} fade speed={1.5} />
        <ambientLight intensity={0.5} />
        
        {/* Main Searchlight */}
        <SpotLight 
          position={[userLocal.x, 100, userLocal.z]} 
          angle={0.25} 
          penumbra={1} 
          intensity={15} 
          color="#3b82f6" 
          castShadow 
        />

        {/* Real Buildings (1000m Area) */}
        {osmData.buildings.map(b => (
          <RealBuilding key={b.id} coords={b.coords} height={b.height} type={b.type} />
        ))}

        {/* Crowd Simulation - "Light Peoples" */}
        <PeopleCluster center={userLocal} count={30} radius={60} color="#60a5fa" />
        <PeopleCluster center={{ x: userLocal.x + 200, z: userLocal.z - 100 }} count={50} radius={100} color="#fbbf24" />

        {/* Live Entities */}
        {entities.map(e => (
          <LiveEntity key={e.id} pos={e.pos} color={e.color} label={e.type} />
        ))}

        {/* Tactical Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3000, 3000]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.2} />
        </mesh>
        <gridHelper args={[2000, 80, "#1e293b", "#0f172a"]} position={[0, 0.1, 0]} />

        <Environment preset="night" />
        <ContactShadows resolution={1024} scale={200} blur={1} far={15} opacity={0.8} />
      </Canvas>

      {/* 3D Dashboard Navigation HUD */}
      <div className="absolute top-8 left-8 pointer-events-none flex flex-col gap-4">
        <motion.div 
           initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
           className="p-6 glass border border-white/10 rounded-[36px] bg-white/5 backdrop-blur-3xl shadow-2xl"
        >
           <div className="flex items-center gap-4 mb-5">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">FIELD ENGAGEMENT</h2>
           </div>
           
           <div className="space-y-4">
              <StatItem label="BUILDING HYDRATION" val={`${osmData.buildings.length} units`} />
              <StatItem label="POPULATION SCAN" val="832 L-PEOPLE" />
              <div className="h-px bg-white/10 my-2" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
                 {loading ? "SEARCHING GIS DATABASE..." : "TERRAIN SYNC 100% OK"}
              </span>
           </div>
        </motion.div>
      </div>

      <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
         <div className="px-5 py-3 glass rounded-2xl border border-white/10 text-white shadow-xl">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Optical Engine</span>
            <span className="text-2xl font-black italic tracking-tighter">FOLLOWING</span>
         </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, val }) => (
  <div className="flex items-center justify-between gap-16">
    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-black text-white">{val}</span>
  </div>
);

export default Scene3D;

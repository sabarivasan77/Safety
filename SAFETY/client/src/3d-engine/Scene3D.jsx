import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Float, Text, Trail, Sparkles, SpotLight, useDepthBuffer, PresentationControls, Instances, Instance, Line } from '@react-three/drei';
import { useUser } from '../context/UserContext';
import { osmService } from '../services/osmService';
import * as THREE from 'three';
import { motion } from 'framer-motion';

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
    <mesh ref={ref} castShadow>
       <sphereGeometry args={[0.3, 8, 8]} />
       <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
};

const RealRoad = ({ coords, width }) => {
  const geometry = useMemo(() => {
    const points = coords.map(c => {
      const p = toLocal(c[1], c[0]);
      return new THREE.Vector3(p.x, 0.05, p.z);
    });
    if (points.length < 2) return null;

    const curve = new THREE.CatmullRomCurve3(points, false, 'chordal');
    const sections = Math.max(points.length * 4, 30);
    const pts = curve.getPoints(sections);
    
    const vertices = [];
    const indices = [];

    // Calculate left/right edge coordinates to form a perfectly flat surface on the XZ plane
    for (let i = 0; i <= sections; i++) {
        const p = pts[i];
        
        // Approximate tangent dynamically based on neighbors
        const pPrev = i === 0 ? pts[0] : pts[i - 1];
        const pNext = i === sections ? pts[sections] : pts[i + 1];
        const dx = pNext.x - pPrev.x;
        const dz = pNext.z - pPrev.z;
        const len = Math.sqrt(dx*dx + dz*dz) || 1;
        
        // Perpendicular vector mapping to XZ plane
        const nx = -dz / len;
        const nz = dx / len;

        const leftX = p.x + nx * (width / 2);
        const leftZ = p.z + nz * (width / 2);
        
        const rightX = p.x - nx * (width / 2);
        const rightZ = p.z - nz * (width / 2);

        vertices.push(leftX, 0.05, leftZ);
        vertices.push(rightX, 0.05, rightZ);
    }

    // Two triangles per section
    for (let i = 0; i < sections; i++) {
        const v1 = i * 2;
        const v2 = v1 + 1;
        const v3 = v1 + 2;
        const v4 = v1 + 3;
        
        indices.push(v1, v2, v3);
        indices.push(v2, v4, v3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [coords, width]);

  const pointsCenter = useMemo(() => {
     return coords.map(c => {
       const p = toLocal(c[1], c[0]);
       return new THREE.Vector3(p.x, 0.08, p.z);
     });
  }, [coords]);

  if (!geometry) return null;

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
         <meshStandardMaterial color="#273445" roughness={0.9} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      {/* Dashed Center Road Stripe for Wide Roads */}
      {width >= 8 && pointsCenter.length > 1 && (
         <Line points={pointsCenter} color="#ffffff" lineWidth={1.5} dashed dashSize={4} gapSize={3} opacity={0.6} transparent />
      )}
    </group>
  );
};

const TrafficSignal = ({ lat, lng }) => {
  const pos = useMemo(() => toLocal(lat, lng), [lat, lng]);
  const [activeSignal, setActiveSignal] = useState(0); 
  
  useFrame((state) => {
    // Unique cycle offset by position
    const offset = pos.x + pos.z; 
    const t = state.clock.getElapsedTime();
    const cycle = Math.floor((t + offset/100) / 4) % 3; // 4s green, 4s yellow, 4s red
    setActiveSignal(cycle); // 0: green, 1: yellow, 2: red
  });

  return (
    <group position={[pos.x, 0, pos.z]}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Signal Box */}
      <mesh position={[0.4, 3.5, 0]} castShadow>
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      
      {/* RED */}
      <mesh position={[0.66, 4.0, 0]}>
         <sphereGeometry args={[0.15]} />
         <meshStandardMaterial color={activeSignal === 2 ? "#ef4444" : "#2a0606"} emissive={activeSignal === 2 ? "#ef4444" : "#000"} emissiveIntensity={3} />
         {activeSignal === 2 && <pointLight distance={10} intensity={0.5} color="#ef4444" />}
      </mesh>
      {/* YELLOW */}
      <mesh position={[0.66, 3.5, 0]}>
         <sphereGeometry args={[0.15]} />
         <meshStandardMaterial color={activeSignal === 1 ? "#eab308" : "#291503"} emissive={activeSignal === 1 ? "#eab308" : "#000"} emissiveIntensity={3} />
      </mesh>
      {/* GREEN */}
      <mesh position={[0.66, 3.0, 0]}>
         <sphereGeometry args={[0.15]} />
         <meshStandardMaterial color={activeSignal === 0 ? "#22c55e" : "#021c0d"} emissive={activeSignal === 0 ? "#22c55e" : "#000"} emissiveIntensity={3} />
         {activeSignal === 0 && <pointLight distance={10} intensity={0.5} color="#22c55e" />}
      </mesh>
    </group>
  );
};

const Vehicle = ({ curve, speed = 1, color = "#ef4444" }) => {
  const ref = useRef();
  const offset = useMemo(() => Math.random(), []);
  
  useFrame((state) => {
    if (!curve) return;
    const time = state.clock.getElapsedTime();
    const t = ((time * speed * 0.05) + offset) % 1;
    
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    
    ref.current.position.copy(pos);
    ref.current.position.y = 0.5; 
    
    const target = pos.clone().add(tangent);
    ref.current.lookAt(target);
  });

  return (
    <group ref={ref}>
      {/* Car Body */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 0.7, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      
      {/* Cabin & Glass */}
      <mesh castShadow position={[0, 1.2, -0.2]}>
        <boxGeometry args={[1.3, 0.6, 1.8]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} thickness={1} roughness={0.1} clearcoat={1} />
      </mesh>
      
      {/* Wheels */}
      {[-0.8, 0.8].map((x, i) => 
        [-1, 1].map((z, j) => (
          <mesh castShadow key={`${i}-${j}`} position={[x, 0.3, z]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
             <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Emissive Headlights */}
      <mesh position={[0.5, 0.6, 1.61]}><sphereGeometry args={[0.15]} /><meshBasicMaterial color="#fef08a" /></mesh>
      <mesh position={[-0.5, 0.6, 1.61]}><sphereGeometry args={[0.15]} /><meshBasicMaterial color="#fef08a" /></mesh>
      
      {/* Emissive Taillights */}
      <mesh position={[0.5, 0.6, -1.61]}><sphereGeometry args={[0.15]} /><meshBasicMaterial color="#ef4444" /></mesh>
      <mesh position={[-0.5, 0.6, -1.61]}><sphereGeometry args={[0.15]} /><meshBasicMaterial color="#ef4444" /></mesh>
    </group>
  );
};

const StreetLampInstances = ({ positions }) => {
  if (!positions || positions.length === 0) return null;
  return (
    <group>
      <Instances range={positions.length} castShadow>
         <cylinderGeometry args={[0.06, 0.1, 8]} />
         <meshStandardMaterial color="#334155" metalness={0.8} />
         {positions.map((p, i) => <Instance key={`pole-${i}`} position={[p.x, 4, p.z]} />)}
      </Instances>
      <Instances range={positions.length}>
         <sphereGeometry args={[0.4, 8, 8]} />
         <meshBasicMaterial color="#fef08a" />
         {positions.map((p, i) => <Instance key={`light-${i}`} position={[p.x, 8, p.z]} />)}
      </Instances>
    </group>
  );
};

const TreeInstances = ({ treeData }) => {
  if (!treeData || treeData.length === 0) return null;
  return (
    <group>
      <Instances range={treeData.length} castShadow receiveShadow>
         <sphereGeometry args={[1.8, 6, 6]} />
         <meshStandardMaterial color="#166534" roughness={0.9} />
         {treeData.map((t, i) => {
            const pos = toLocal(t.lat, t.lon);
            return <Instance key={`leaf-${i}`} position={[pos.x, 2, pos.z]} scale={1 + Math.random() * 0.4} />
         })}
      </Instances>
      <Instances range={treeData.length} castShadow receiveShadow>
         <cylinderGeometry args={[0.2, 0.3, 2]} />
         <meshStandardMaterial color="#451a03" roughness={1} />
         {treeData.map((t, i) => {
            const pos = toLocal(t.lat, t.lon);
            return <Instance key={`trunk-${i}`} position={[pos.x, 1, pos.z]} />
         })}
      </Instances>
    </group>
  );
}

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

  const matColor = useMemo(() => {
     if (type === 'emergency') return '#ef4444';
     const colors = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1'];
     return colors[Math.floor(Math.random() * colors.length)];
  }, [type]);

  if (!shape) return null;

  return (
    <group position={[0, height / 2, 0]}>
      {/* Primary Extruded Structure */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth: height, bevelEnabled: false }]} />
        <meshPhysicalMaterial 
          color={matColor} 
          emissive={type === 'emergency' ? '#ff0000' : '#000000'}
          emissiveIntensity={0.2}
          roughness={0.6}
          metalness={0.3}
          clearcoat={0.3}
        />
      </mesh>
      
      {/* Architectural Roof Cap details */}
      <mesh position={[0, height / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
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
      <Text position={[0, 7, 0]} fontSize={1.4} color="#38bdf8" fontStyle="italic" fontWeight="bold">
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
  const [osmData, setOsmData] = useState({ buildings: [], roads: [], trafficSignals: [], trees: [] });
  const [loading, setLoading] = useState(true);

  const userLocal = useMemo(() => toLocal(userState.currentLocation.lat, userState.currentLocation.lng), [userState.currentLocation]);

  useEffect(() => {
    let active = true;
    const fetchOSM = async () => {
      try {
        setLoading(true);
        // Reduce radius to 1200m for drastically faster API response speeds & fewer draw calls
        const data = await osmService.getBuildings(userState.currentLocation.lat, userState.currentLocation.lng, 1200);
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

  // Generate structural elements
  const vehicleCurves = useMemo(() => {
    return osmData.roads
      .filter(r => r.coords.length >= 2)
      .map(r => {
        const pts = r.coords.map(c => {
          const p = toLocal(c[1], c[0]);
          return new THREE.Vector3(p.x, 0, p.z);
        });
        return new THREE.CatmullRomCurve3(pts, false, 'chordal');
      });
  }, [osmData.roads]);

  // Procedural Street Lamps Placement
  const lampPositions = useMemo(() => {
    const lamps = [];
    osmData.roads.forEach(r => {
      if (r.width > 6) { // Lamps on wider roads
        r.coords.forEach((c, idx) => {
          if (idx % 3 === 0) { // Every 3rd coordinate node
             const p = toLocal(c[1], c[0]);
             // Shift to edge of road
             lamps.push(new THREE.Vector3(p.x + (r.width/2 + 0.5), 0, p.z));
          }
        });
      }
    });
    return lamps;
  }, [osmData.roads]);

  return (
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden premium-shadow border border-slate-200">
      <Canvas shadows camera={{ position: [150, 150, 150], fov: 45 }}>
        <fog attach="fog" args={['#f8fafc', 50, 600]} />
        <FocusCamera target={userLocal} />
        <color attach="background" args={['#f8fafc']} />
        
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight 
           position={[100, 200, 50]} 
           intensity={1.5} 
           castShadow 
           shadow-mapSize={[2048, 2048]} 
           shadow-camera-left={-200}
           shadow-camera-right={200}
           shadow-camera-top={200}
           shadow-camera-bottom={-200}
           color="#fef9c3" 
        />
        
        {/* Soft fill light */}
        <directionalLight position={[-50, 100, -50]} intensity={0.5} color="#bfdbfe" />

        {/* Real Buildings */}
        {osmData.buildings.map(b => (
          <RealBuilding key={b.id} coords={b.coords} height={b.height} type={b.type} />
        ))}

        {/* Real Roads */}
        {osmData.roads.map(r => (
           <RealRoad key={r.id} coords={r.coords} width={r.width || 6} />
        ))}

        {/* Instanced Procedural Street Lamps */}
        <StreetLampInstances positions={lampPositions} />

        {/* Forest / Trees */}
        <TreeInstances treeData={osmData.trees?.slice(0, 500)} />

        {/* Traffic Signals */}
        {osmData.trafficSignals?.slice(0, 100).map(s => (
           <TrafficSignal key={s.id} lat={s.lat} lng={s.lon} />
        ))}

        {/* Vehicles */}
        {vehicleCurves.slice(0, 50).map((curve, idx) => (
           <Vehicle key={idx} curve={curve} speed={idx % 2 === 0 ? 1 : 1.5} color={['#2563EB', '#22C55E', '#ef4444', '#f59e0b', '#64748b'][idx % 5]} />
        ))}

        {/* Crowd Simulation - "Light Peoples" */}
        <PeopleCluster center={userLocal} count={30} radius={60} color="#2563EB" />
        <PeopleCluster center={{ x: userLocal.x + 200, z: userLocal.z - 100 }} count={50} radius={100} color="#22C55E" />

        {/* Live Entities */}
        {entities.map(e => (
          <LiveEntity key={e.id} pos={e.pos} color={e.color} label={e.type} />
        ))}

        {/* Premium Base Ground Layer */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#f1f5f9" roughness={1} />
        </mesh>
        
        {/* Dynamic Atmospheric Environmental Depth (Dust/Glow) */}
        <Sparkles count={500} scale={1000} size={15} speed={0.4} opacity={0.3} color="#94a3b8" position={[0, 50, 0]} />

        <Environment preset="city" />
      </Canvas>

      {/* 3D Dashboard Navigation HUD - Premium Clean Theme */}
      <div className="absolute top-8 right-4 sm:right-8 pointer-events-none hidden md:flex flex-col items-end gap-3 z-[1000]">
         <div className="px-5 py-3 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl text-slate-800 shadow-xl w-64 text-right shadow-slate-200/50">
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Optical Engine</span>
            <span className="text-2xl font-black italic tracking-tighter">FOLLOWING</span>
         </div>

        <motion.div 
           initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
           className="p-6 border border-slate-200 rounded-[28px] bg-white/90 backdrop-blur-xl shadow-xl w-64 shadow-slate-200/50"
        >
           <div className="flex items-center gap-4 mb-5">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">GIS STATUS</h2>
           </div>
           
           <div className="space-y-4">
              <StatItem label="BUILDINGS" val={osmData.buildings.length} />
              <StatItem label="ROADS" val={osmData.roads.length} />
              <StatItem label="NATURE OBJECTS" val={osmData.trees?.length || 0} />
              <div className="h-px bg-slate-200 my-2" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none block break-words">
                 {loading ? "SEARCHING GIS DATABASE..." : "TERRAIN SYNC 100% OK"}
              </span>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatItem = ({ label, val }) => (
  <div className="flex items-center justify-between gap-16">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-black text-slate-900">{val}</span>
  </div>
);

export default Scene3D;

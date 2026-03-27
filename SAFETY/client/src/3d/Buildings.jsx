import React, { useMemo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const Buildings = ({ data, center }) => {
  const [cx, cy] = center;

  const mergedGeometry = useMemo(() => {
    if (!data || data.length === 0) return null;

    const geometries = [];
    data.forEach(b => {
      if (b.coords.length < 3) return;
      
      const shape = new THREE.Shape();
      b.coords.forEach((c, i) => {
        const x = (c[0] - cx) * 111320 * Math.cos(cy * Math.PI / 180);
        const y = (c[1] - cy) * 111320;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });

      const extrudeSettings = {
        depth: b.height || 10,
        bevelEnabled: false
      };

      geometries.push(new THREE.ExtrudeGeometry(shape, extrudeSettings));
    });

    if (geometries.length === 0) return null;
    return BufferGeometryUtils.mergeGeometries(geometries);
  }, [data, center]);

  if (!mergedGeometry) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
       <mesh geometry={mergedGeometry}>
         <meshStandardMaterial color="#E2E8F0" metalness={0.1} roughness={0.5} />
       </mesh>
    </group>
  );
};

export default Buildings;

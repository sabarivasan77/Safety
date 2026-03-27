import React, { useMemo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const Roads = ({ data, center }) => {
  const [cx, cy] = center;

  const roadGeometries = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(road => {
      if (!road.coords || road.coords.length < 2) return null;

      const points = road.coords.map(c => {
        const x = (c[0] - cx) * 111320 * Math.cos(cy * Math.PI / 180);
        const z = (c[1] - cy) * 111320 * -1;
        return new THREE.Vector3(x, 0, z);
      });

      try {
        const curve = new THREE.CatmullRomCurve3(points);
        const lanes = road.lanes || 2;
        const width = Math.max(lanes * 3, 2);

        return {
          id: road.id,
          geometry: new THREE.TubeGeometry(curve, 12, width / 2, 4, false),
          type: road.type
        };
      } catch (err) {
        console.warn("Road geometry failed for way:", road.id);
        return null;
      }
    }).filter(g => !!g);
  }, [data, center]);

  const mergedRoads = useMemo(() => {
    if (roadGeometries.length === 0) return null;
    const geometries = roadGeometries.map(rg => rg.geometry);
    try {
      return BufferGeometryUtils.mergeGeometries(geometries);
    } catch (e) {
      console.error("Road merging failed", e);
      return null;
    }
  }, [roadGeometries]);

  if (!mergedRoads) return null;

  return (
    <mesh geometry={mergedRoads}>
      <meshStandardMaterial color="#475569" roughness={1} metalness={0} />
    </mesh>
  );
};

export default Roads;

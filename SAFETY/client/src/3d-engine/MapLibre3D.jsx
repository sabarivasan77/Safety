import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapLibre3D = ({ routes, activeRouteId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty', // 100% Free, no keys
      center: [78, 20],
      zoom: 5,
      pitch: 45,
      bearing: -17,
      antialias: true
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // OpenFreeMap Layer: "building" usually has height in Meters
      if (map.current.getSource('openmaptiles')) {
         map.current.addLayer({
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
               'fill-extrusion-color': '#E2E8F0',
               'fill-extrusion-height': ['get', 'render_height'],
               'fill-extrusion-base': ['get', 'render_min_height'],
               'fill-extrusion-opacity': 0.8
            }
         });
      }
      
      // Setup Route layering
      map.current.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        }
      });

      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#2563EB',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });
    });
  }, []);

  // Update Route on Map
  useEffect(() => {
    if (!map.current || !routes || routes.length === 0) return;

    const activeRoute = routes.find(r => r.id === activeRouteId) || routes[0];
    const coordinates = activeRoute.geometry.coordinates;

    const source = map.current.getSource('route');
    if (source) {
      source.setData({
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      });
    }

    // Fit map to route (3D)
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce((acc, coord) => {
        return acc.extend(coord);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 100, pitch: 45 });
    }
  }, [routes, activeRouteId]);

  return (
    <div className="w-full h-full relative">
       <div ref={mapContainer} className="absolute inset-0 z-0 bg-slate-100" />
       
       {/* 3D Status Overlay */}
       <div className="absolute top-6 left-6 z-10">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-xl flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[#111827]">MapLibre 3D Active</span>
          </div>
       </div>
    </div>
  );
};

export default MapLibre3D;

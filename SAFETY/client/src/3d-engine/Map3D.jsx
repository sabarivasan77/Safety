import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map3D = ({ routes, activeRouteId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty', // Robust free style
      center: [78, 20],
      zoom: 5,
      pitch: 45,
      bearing: -17,
      antialias: true,
      fadeDuration: 300
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    const add3DLayer = () => {
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
    };

    map.current.on('load', () => {
      add3DLayer();

      // Setup Route Layer
      map.current.addSource('route', {
        'type': 'geojson',
        'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } }
      });

      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-color': '#2563EB', 'line-width': 6, 'line-opacity': 0.8 }
      });
    });
  }, []);

  // Sync route to 3D map
  useEffect(() => {
    if (!map.current || !routes || routes.length === 0) return;

    const activeRoute = routes.find(r => r.id === activeRouteId) || routes[0];
    const source = map.current.getSource('route');
    
    if (source) {
      source.setData({
        'type': 'Feature',
        'properties': {},
        'geometry': activeRoute.geometry
      });
      
      const bounds = activeRoute.geometry.coordinates.reduce((acc, coord) => {
        return acc.extend(coord);
      }, new maplibregl.LngLatBounds(activeRoute.geometry.coordinates[0], activeRoute.geometry.coordinates[0]));

      map.current.fitBounds(bounds, { padding: 100, pitch: 45, animate: true, duration: 1000 });
    }
  }, [routes, activeRouteId]);

  return <div ref={mapContainer} className="w-full h-full bg-slate-50" />;
};

export default Map3D;

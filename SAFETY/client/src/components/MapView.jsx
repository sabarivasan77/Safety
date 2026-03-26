import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MOCK_ROUTES, RISK_ZONES } from '../data/mockData';

// Public access token for development/demo (User should replace with their own)
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FiYXJpLXJhbSIsImEiOiJjbTdiaDljdzYwMm0xMmtxEHRmYXNqZWNyIn0.oP6V8LwM7-wN_S7-X8v8-A';

const MapView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(77.5946); // Bangalore center
  const [lat, setLat] = useState(12.9716);
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    if (map.current) return;
    
    console.log('Initializing Mapbox...');
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [lng, lat],
        zoom: zoom,
        antialias: true,
        failIfMajorPerformanceCaveat: false
      });

      map.current.on('error', (e) => {
        console.error('MAPBOX_ERROR:', e.error?.message || e.error || 'Unknown Mapbox Error');
      });

      const handleResize = () => {
        if (map.current) map.current.resize();
      };

      map.current.on('load', async () => {
        console.log('Map Ready');
        window.addEventListener('resize', handleResize);

      // Add Crime Heatmap Layer
      map.current.addSource('risk-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: RISK_ZONES.map(zone => ({
            type: 'Feature',
            properties: { intensity: zone.intensity, message: zone.message },
            geometry: {
              type: 'Point',
              coordinates: zone.center
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'risk-heatmap',
        type: 'heatmap',
        source: 'risk-zones',
        maxzoom: 18,
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 18, 5],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(16, 185, 129, 0.2)',
            0.5, 'rgba(245, 158, 11, 0.4)',
            0.8, 'rgba(239, 68, 68, 0.6)',
            1, 'rgba(239, 68, 68, 0.8)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 5, 18, 30],
          'heatmap-opacity': 0.7
        }
      });

      // Add Routes (Emerald Glow & Electric Blue)
      MOCK_ROUTES.forEach(route => {
        map.current.addSource(route.id, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.path
            }
          }
        });

        map.current.addLayer({
          id: route.id,
          type: 'line',
          source: route.id,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': route.type === 'safe' ? '#10b981' : '#3b82f6',
            'line-width': 8,
            'line-opacity': 0.9
          }
        });
      });

      // Fetch Community Reports from Backend
      try {
        const res = await fetch('http://localhost:5000/api/reports');
        const reports = await res.json();
        reports.forEach(report => {
           new mapboxgl.Marker({ color: '#ef4444' })
             .setLngLat([report.location.lng, report.location.lat])
             .setPopup(new mapboxgl.Popup().setHTML(`<b>Hazard:</b> ${report.comment}`))
             .addTo(map.current);
        });
      } catch (e) {}

      // Add Markers for current location
      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([77.5946, 12.9716])
        .setPopup(new mapboxgl.Popup().setHTML('<h1>Current Position</h1>'))
        .addTo(map.current);
    });

      // Cleanup
      return () => {
        if (handleResize) window.removeEventListener('resize', handleResize);
        if (map.current) map.current.remove();
      };
    } catch (e) {
      console.error('MAPBOX_INIT_ERROR:', e);
    }
  }, []);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default MapView;

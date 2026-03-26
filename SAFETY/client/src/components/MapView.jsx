import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView = ({ routes, activeRouteId, reports }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(78.9629); // Center of India (example)
  const [lat, setLat] = useState(20.5937);
  const [zoom, setZoom] = useState(5);

  const markers = useRef([]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // default light mode
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.current.on('load', () => {
      // Add routing-related sources
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#2563EB',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      // Add crime heatmap source
      map.current.addSource('crime-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current.addLayer({
        id: 'crime-heatmap',
        type: 'heatmap',
        source: 'crime-zones',
        maxzoom: 15,
        paint: {
          'heatmap-weight': {
            property: 'intensity',
            type: 'exponential',
            stops: [[1, 0], [6, 1]]
          },
          'heatmap-intensity': {
            stops: [[11, 1], [15, 3]]
          },
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(236,222,239,0)',
            0.2, 'rgb(208,209,230)',
            0.4, 'rgb(166,189,219)',
            0.6, 'rgb(103,169,207)',
            0.8, 'rgb(28,144,153)'
          ],
          'heatmap-radius': {
            stops: [[11, 15], [15, 20]]
          },
          'heatmap-opacity': {
            default: 1,
            stops: [[14, 1], [15, 0]]
          }
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
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      });
    }

    // Fit map to route
    const bounds = coordinates.reduce((acc, coord) => {
      return acc.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.current.fitBounds(bounds, { padding: 80 });

  }, [routes, activeRouteId]);

  // Update Markers and Heatmap from Reports
  useEffect(() => {
    if (!map.current || !reports) return;

    // Clear old markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Update Heatmap data
    const crimeSource = map.current.getSource('crime-zones');
    if (crimeSource) {
      crimeSource.setData({
        type: 'FeatureCollection',
        features: reports.filter(r => r.type === 'crime').map(r => ({
          type: 'Feature',
          properties: { intensity: r.severity || 5 },
          geometry: { type: 'Point', coordinates: [r.location.lng, r.location.lat] }
        }))
      });
    }

    // Add individual markers for other incidents
    reports.forEach(report => {
      if (report.type !== 'crime') {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = report.type === 'lighting' ? '#F59E0B' : '#EF4444';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([report.location.lng, report.location.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${report.type}</h3><p>${report.comment || 'No comment'}</p>`))
          .addTo(map.current);
        
        markers.current.push(marker);
      }
    });

  }, [reports]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapContainer} className="map-container absolute inset-0 rounded-3xl" />
      
      {/* Map Overlay Stats */}
      <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
         <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-xl inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Safety Overlay Active</span>
         </div>
      </div>
    </div>
  );
};

export default MapView;

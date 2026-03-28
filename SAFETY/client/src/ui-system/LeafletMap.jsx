import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not rendering in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LeafletMap = ({ routes, activeRouteId, reports }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayers = useRef([]);

  useEffect(() => {
    if (map.current) return; // Only init once

    map.current = L.map(mapContainer.current).setView([20, 78], 5); // Default: center of India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);
  }, []);

  // Update Routes
  useEffect(() => {
    if (!map.current || !routes || routes.length === 0) return;

    // Clear old route layers
    routeLayers.current.forEach(layer => map.current.removeLayer(layer));
    routeLayers.current = [];

    routes.forEach((route, index) => {
      const isSelected = route.id === activeRouteId;
      const points = route.geometry.coordinates.map(c => [c[1], c[0]]); // Leaflet uses [lat, lon]
      
      const polyline = L.polyline(points, {
        color: isSelected ? '#2563EB' : '#94A3B8',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.6
      }).addTo(map.current);

      if (isSelected) {
        map.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }

      routeLayers.current.push(polyline);
    });
  }, [routes, activeRouteId]);

  return <div ref={mapContainer} className="w-full h-full relative z-0" />;
};

export default LeafletMap;

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUser } from '../context/UserContext';
import { RouteService } from '../services/routeService';
import { SafetyService } from '../services/safetyService';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="custom-marker-inner" style="background-color: ${color}">•</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const startIcon = createIcon('#3b82f6'); // blue
const endIcon = createIcon('#ef4444');   // red
const helpIcons = {
  police: createIcon('#1e40af'),
  hospital: createIcon('#dc2626'),
  petrol: createIcon('#ca8a04')
};

// Component to handle map center updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
  }, [center, map]);
  return null;
};

// Component to handle map bounds when route changes
const RouteBounds = ({ route }) => {
  const map = useMap();
  useEffect(() => {
    if (route && route.geometry && route.geometry.coordinates.length > 0) {
      const bounds = L.latLngBounds(route.geometry.coordinates.map(c => [c[1], c[0]]));
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [route, map]);
  return null;
};

const Map2D = () => {
  const { userState, setUserState, updateLocation } = useUser();
  const [routes, setRoutes] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [nearbyHelp, setNearbyHelp] = useState([]);

  // Load routes when start/end change
  useEffect(() => {
    const fetchRoute = async () => {
      if (userState.start && userState.destination) {
        const result = await RouteService.getRoutes(
          userState.start.lat, userState.start.lng,
          userState.destination.lat, userState.destination.lng
        );
        if (result) {
          setRoutes(result);
          // Auto-select safe route if available, otherwise fastest
          const selected = result.safe || result.fastest;
          setActiveRoute(selected);
          setUserState(prev => ({ ...prev, routes: result, selectedRoute: selected }));
          
          // Also fetch nearby help for destination
          const helpPoints = await SafetyService.getNearbyHelp(userState.destination.lat, userState.destination.lng, 'police');
          setNearbyHelp(helpPoints);
          setUserState(prev => ({ ...prev, nearbyHelp: helpPoints }));
        }
      }
    };
    fetchRoute();
  }, [userState.start, userState.destination]);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden glass premium-shadow border-none">
      <MapContainer 
        center={[userState.currentLocation.lat, userState.currentLocation.lng]} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        
        {/* Map UI Control Positioners would go here if needed */}
        <MapUpdater center={userState.start || userState.currentLocation} />
        
        {/* Markers */}
        {userState.start && (
          <Marker position={[userState.start.lat, userState.start.lng]} icon={startIcon}>
            <Popup className="premium-popup">
              <div className="p-1">
                <p className="font-bold text-slate-800">Starting Point</p>
                <p className="text-xs text-slate-500">{userState.start.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {userState.destination && (
          <Marker position={[userState.destination.lat, userState.destination.lng]} icon={endIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-red-600">Destination</p>
                <p className="text-xs text-slate-500">{userState.destination.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Help Markers */}
        {userState.nearbyHelp?.map(help => (
          <Marker 
            key={help.id} 
            position={[help.lat, help.lng]} 
            icon={helpIcons[help.type] || helpIcons.police}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-blue-800 capitalize">{help.type}: {help.name}</p>
                <p className="text-[10px] text-slate-500">{help.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polylines */}
        {activeRoute && activeRoute.geometry && (
          <>
            <RouteBounds route={activeRoute} />
            {/* The selected route */}
            <Polyline 
              positions={activeRoute.geometry.coordinates.map(c => [c[1], c[0]])}
              color={activeRoute.type === 'safe' ? '#22c55e' : '#3b82f6'}
              weight={6}
              opacity={0.8}
            />
            {/* Other route in background (semi-transparent) */}
            {routes && Object.values(routes).map((r, i) => (
              r && r !== activeRoute && (
                <Polyline 
                  key={i}
                  positions={r.geometry.coordinates.map(c => [c[1], c[0]])}
                  color="#94a3b8"
                  weight={4}
                  opacity={0.4}
                  dashArray="5, 10"
                />
              )
            ))}
          </>
        )}
      </MapContainer>

      {/* Route Selector UI Overlay */}
      {routes && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex gap-3 z-[400]">
          {['fastest', 'safe'].map(type => {
            const r = routes[type];
            if (!r) return null;
            const isSelected = activeRoute === r;
            return (
              <button
                key={type}
                onClick={() => {
                  setActiveRoute(r);
                  setUserState(prev => ({ ...prev, selectedRoute: r }));
                }}
                className={`flex-1 p-3 rounded-2xl glass transition-all border-2 flex flex-col items-center gap-1 ${
                  isSelected ? 'border-primary shadow-lg ring-4 ring-primary/10' : 'border-slate-100 opacity-80'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                  {r.label}
                </span>
                <span className="font-bold text-slate-800">{Math.round(r.duration / 60)} min</span>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.safetyScore > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.safetyScore}% Safe
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Map2D;

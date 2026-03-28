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

// Markers
const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-${color === '#3b82f6' ? 'blue' : 'red'}-500">
            <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const startIcon = createIcon('#3b82f6');
const endIcon = createIcon('#ef4444');

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1 });
    }
  }, [center]);
  return null;
};

const Map2D = () => {
  const { userState, setUserState, updateLocation } = useUser();
  const [routes, setRoutes] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [nearbyHelp, setNearbyHelp] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (userState.start && userState.destination) {
        const result = await RouteService.getRoutes(
          userState.start.lat, userState.start.lng,
          userState.destination.lat, userState.destination.lng
        );
        if (result) {
          setRoutes(result);
          const selected = result.safe || result.fastest;
          setActiveRoute(selected);
          setUserState(prev => ({ ...prev, routes: result, selectedRoute: selected }));
          const helpPoints = await SafetyService.getNearbyHelp(userState.destination.lat, userState.destination.lng, 'police');
          setNearbyHelp(helpPoints);
          setUserState(prev => ({ ...prev, nearbyHelp: helpPoints }));
        }
      }
    };
    fetchRoute();
  }, [userState.start, userState.destination]);

  // Ensure map is visible on load
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col rounded-[32px] overflow-hidden glass shadow-2xl bg-white/5 relative z-[1]">
      <MapContainer 
        center={[userState.currentLocation.lat, userState.currentLocation.lng]} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" // Global OSM tile fallback
        />
        
        <MapUpdater center={userState.start || userState.currentLocation} />
        
        {userState.start && (
          <Marker position={[userState.start.lat, userState.start.lng]} icon={startIcon}>
            <Popup>
               <div className="p-2 font-black text-xs uppercase tracking-widest text-blue-600">Starting Hub</div>
            </Popup>
          </Marker>
        )}

        {userState.destination && (
          <Marker position={[userState.destination.lat, userState.destination.lng]} icon={endIcon}>
            <Popup>
               <div className="p-2 font-black text-xs uppercase tracking-widest text-red-600">Target SafePoint</div>
            </Popup>
          </Marker>
        )}

        {nearbyHelp?.map(help => (
          <Marker key={help.id} position={[help.lat, help.lng]}>
            <Popup><div className="p-1 font-bold text-xs uppercase">{help.type}: {help.name}</div></Popup>
          </Marker>
        ))}

        {activeRoute && activeRoute.geometry && (
          <Polyline 
            positions={activeRoute.geometry.coordinates.map(c => [c[1], c[0]])}
            color={activeRoute.type === 'safe' ? '#22c55e' : '#3b82f6'}
            weight={6}
            opacity={0.8}
            lineCap="round"
          />
        )}
      </MapContainer>

      {/* Route Control Panel Overlay */}
      {routes && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex gap-3 z-[1000]">
           {['safe', 'fastest'].map(type => {
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
                  className={`flex-1 p-4 rounded-3xl glass backdrop-blur-2xl transition-all border-2 flex flex-col items-center gap-1 ${
                    isSelected ? 'border-blue-500 shadow-2xl bg-white/20' : 'border-white/10 opacity-70 bg-black/5'
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {r.label} Route
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-800 tracking-tighter">{Math.round(r.duration / 60)} min</span>
                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${
                      r.safetyScore > 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {r.safetyScore}% SAFE
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

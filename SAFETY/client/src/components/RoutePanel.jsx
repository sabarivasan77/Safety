import React from 'react';
import { Clock, Navigation, ShieldCheck, Zap } from 'lucide-react';
import SafetyIndicator from './SafetyIndicator';

const RoutePanel = ({ routes, activeRouteId, onSelect, safetyData }) => {
  if (!routes || routes.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
        <Navigation size={40} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-400 font-medium text-sm">Select a destination to view route options.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Route Options</h3>
      
      {routes.map((route, index) => {
        const isSafe = index === 0; // Assume first route is the safe one (calculated by our engine)
        const isActive = activeRouteId === route.id;
        const duration = Math.round(route.duration / 60);
        const distance = (route.distance / 1000).toFixed(1);
        
        return (
          <div 
            key={route.id}
            onClick={() => onSelect(route.id)}
            className={`industrial-card p-5 cursor-pointer transition-all border-l-4 ${
              isActive ? (isSafe ? 'border-l-emerald-500 ring-2 ring-emerald-500/10' : 'border-l-blue-500 ring-2 ring-blue-500/10') : 'border-l-transparent hover:border-l-slate-300'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  isSafe ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {isSafe ? 'Recommended' : 'Alternative'}
                </span>
                <h4 className="font-bold text-slate-800 mt-1">{isSafe ? 'Safest Path' : 'Fastest Path'}</h4>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-800 leading-none">{duration}m</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{distance} km</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 bg-slate-50 px-3 py-2 rounded-lg">
               <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {duration} min</span>
               <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-500" /> High Visibility</span>
            </div>

            {isSafe && safetyData && (
              <SafetyIndicator 
                score={safetyData.score} 
                label={safetyData.label} 
                color={safetyData.color} 
                className="scale-95 origin-left"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoutePanel;

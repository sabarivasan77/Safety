import React from 'react';
import { motion } from 'framer-motion';
import { calculateSafetyScore } from '../services/mapService';
import { MOCK_ROUTES } from '../data/mockData';
import { MapPin, ShieldCheck, Clock, Navigation, AlertTriangle, AlertCircle, Share2, Heart, Activity, ActivityIcon, Plus } from 'lucide-react';

const Sidebar = ({ activeRouteId, onRouteSelect }) => {
  return (
    <aside className="w-full md:w-[440px] h-full flex flex-col bg-slate-950/80 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto z-40 relative order-2 md:order-2 shadow-2xl">
      {/* Mobile Drawer Handle */}
      <div className="md:hidden flex justify-center py-3 shrink-0">
         <div className="w-12 h-1 bg-slate-800 rounded-full" />
      </div>

      <div className="p-6 md:p-10 flex flex-col h-full bg-gradient-to-b from-transparent to-slate-950/50">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Navigation Engine</h3>
             <h2 className="text-xl font-bold text-white">Suggested Routes</h2>
          </div>
          <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5">
             <Share2 size={18} />
          </button>
        </div>

        {/* Dynamic Route Cards */}
        <div className="flex flex-col gap-5">
          {MOCK_ROUTES.map((route) => {
             const isSelected = activeRouteId === route.id;
             const safety = calculateSafetyScore({
                crime: route.type === 'safe' ? 1 : 6,
                lighting: route.type === 'safe' ? 9 : 3,
                crowd: 7,
                timeRisk: 2,
                areaType: 8
             });

             return (
               <div 
                 key={route.id} 
                 onClick={() => onRouteSelect(route.id)}
                 className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer relative group overflow-hidden ${isSelected ? 'border-blue-500/50 bg-blue-500/10 shadow-2xl shadow-blue-500/10' : 'border-white/5 bg-slate-900/40 hover:border-white/20'}`}
               >
                  {/* Internal Glow for Selected */}
                  {isSelected && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] pointer-events-none" />}

                  <div className="flex justify-between items-start mb-5 relative z-10">
                     <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block ${route.type === 'safe' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {route.type === 'safe' ? 'Safest Choice' : 'Fastest Path'}
                        </span>
                        <h4 className="font-bold text-white text-lg">{route.name}</h4>
                     </div>
                     <div className="text-right">
                        <p className={`text-2xl font-black italic tracking-tighter leading-none ${route.type === 'safe' ? 'text-emerald-400' : 'text-blue-400'}`}>{safety.score}%</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Safety Index</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-5 text-xs font-medium text-slate-400 mb-6 relative z-10">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5"><Clock size={14} className="text-blue-500" /> {route.duration}</div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5"><Navigation size={14} className="text-blue-500" /> {route.distance}</div>
                  </div>

                  {/* Safety Bar */}
                  <div className="flex items-center gap-3 mb-2 md:mb-6 px-1 relative z-10">
                     <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${safety.score}%` }}
                          className={`h-full shadow-[0_0_15px_rgba(255,255,255,0.3)] ${route.type === 'safe' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        />
                     </div>
                  </div>

                  {isSelected && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-start gap-3 relative z-10"
                    >
                       <AlertCircle size={16} className="text-emerald-500 shrink-0 mt-1" />
                       <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{safety.description}</p>
                    </motion.div>
                  )}
               </div>
             );
          })}
        </div>

        {/* SOS Emergency Hub */}
        <div className="mt-12 md:mt-auto pt-8 border-t border-white/5">
           <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Security Actions</span>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
           </div>
           <button className="group relative w-full py-5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-3xl transition-all overflow-hidden active:scale-95">
              <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="flex items-center justify-center gap-3">
                 <Heart size={22} className="text-red-500" fill="currentColor" />
                 <span className="text-red-500 font-black uppercase tracking-widest text-sm">Activate SOS Signal</span>
              </div>
           </button>
           <p className="text-center text-[10px] font-bold text-slate-600 mt-5 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Emergency Settings & Contacts</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

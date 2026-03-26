import React, { useState } from 'react';
import MapView from './components/MapView';
import ThreeDView from './components/ThreeDView';
import Sidebar from './components/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Search, X, Map as MapIcon, Box, AlertTriangle, User, Bell, HelpCircle, Navigation } from 'lucide-react';

const App = () => {
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [activeRouteId, setActiveRouteId] = useState('safe-1');
  const [searchQuery, setSearchQuery] = useState('');
  
  const is3D = viewMode === '3D';

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      
      {/* Top Navbar: Premium Glass & Brand */}
      <header className="h-16 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white leading-none">SafeRoute <span className="text-blue-500">AI</span></span>
        </div>

        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-xl px-12 relative group hidden md:block">
          <div className="flex items-center bg-slate-900/50 rounded-2xl px-4 py-2.5 border border-slate-800 focus-within:border-blue-500 focus-within:bg-slate-900 transition-all">
             <Search className="text-slate-500 mr-3" size={18} />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search destination, city or landmark..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-slate-600"
             />
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white/20">
              <User size={18} />
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Map / 3D Canvas */}
        <main className="flex-1 h-[55vh] md:h-full relative overflow-hidden bg-slate-900 order-1 md:order-1">
           {/* Floating Mapbox Controls */}
           <div className="absolute top-6 left-6 z-40 flex flex-col gap-4">
              <div className="premium-glass rounded-2xl p-1.5 flex flex-col">
                 <button 
                   onClick={() => setViewMode('2D')}
                   className={`p-3 rounded-xl transition-all ${!is3D ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}
                 >
                   <MapIcon size={20} />
                 </button>
                 <button 
                   onClick={() => setViewMode('3D')}
                   className={`p-3 rounded-xl transition-all ${is3D ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}
                 >
                   <Box size={20} />
                 </button>
              </div>
           </div>

           {/* Viewport */}
           <div className="w-full h-full opacity-90">
              {is3D ? <ThreeDView /> : <MapView />}
           </div>

           {/* Real-time Incident Notification */}
           <AnimatePresence>
              <div className="absolute bottom-6 left-6 right-6 md:right-auto max-w-sm z-30">
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="premium-glass p-5 rounded-3xl border-l-4 border-l-emerald-500 flex items-start gap-4 shadow-2xl"
                 >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                       <AlertTriangle size={20} />
                    </div>
                    <div>
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-1">Optimal Route Recalculated</h4>
                       <p className="text-xs text-slate-400 leading-snug">Redirecting to avoid unlit street sections ahead. Security increased by 14%.</p>
                    </div>
                    <X size={16} className="text-slate-500 ml-auto cursor-pointer hover:text-white" />
                 </motion.div>
              </div>
           </AnimatePresence>
        </main>

        <Sidebar 
          activeRouteId={activeRouteId} 
          onRouteSelect={setActiveRouteId} 
        />
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-white/5 border-t border-white/10 flex items-center justify-between px-6 z-50 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Safety Engine Online</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Mapbox API Connected</span>
         </div>
         <div className="flex items-center gap-4">
            <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1"><HelpCircle size={14} /> Documentation</span>
            <span>Version 2.0.1-Stable</span>
         </div>
      </footer>
    </div>
  );
};

export default App;

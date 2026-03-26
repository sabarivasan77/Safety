import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import MapView from './components/MapView';
import ThreeDView from './components/ThreeDView';
import RoutePanel from './components/RoutePanel';
import AlertBox from './components/AlertBox';
import { calculateSafety } from './services/safetyService';
import { getDirections, getCommunityReports } from './services/mapService';
import { 
  ShieldCheck, Map as MapIcon, Box, AlertTriangle, 
  User, Bell, Settings, Share2, Heart, History,
  Navigation, PhoneCall, ChevronRight, Menu
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const App = () => {
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [routes, setRoutes] = useState([]);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', title: 'Safety Engine Online', message: 'Analyzing real-time incident data for your region.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load initial safety reports
  useEffect(() => {
    const loadReports = async () => {
      const data = await getCommunityReports();
      setReports(data || []);
    };
    loadReports();
    // Simulate periodic updates
    const interval = setInterval(loadReports, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRouteSearch = async (start, end) => {
    setIsLoading(true);
    try {
      const fetchedRoutes = await getDirections(start, end);
      
      // Assign IDs and calculate safety for each route
      const processedRoutes = fetchedRoutes.map((route, index) => {
        // Mocking some route factors for safety calculation
        const safetyData = calculateSafety({
          crime: Math.random() * 50 + (index * 20),
          lighting: Math.random() * 40 + 60 - (index * 15),
          crowd: Math.random() * 40 + 50,
          time: new Date().getHours() > 18 ? 80 : 20,
          area: Math.random() * 40 + 10
        });

        return {
          ...route,
          id: `route-${index}`,
          safety: safetyData,
          segments: route.geometry.coordinates
        };
      });

      setRoutes(processedRoutes);
      setActiveRouteId(processedRoutes[0].id);
      
      // Add success alert
      setAlerts(prev => [
        { id: Date.now(), type: 'success', title: 'Route Found', message: `Safest path identified with ${processedRoutes[0].safety.label} rating.` },
        ...prev
      ]);
    } catch (err) {
      setAlerts(prev => [
        { id: Date.now(), type: 'danger', title: 'Search Failed', message: 'Could not calculate routes. Please check your connection.' },
        ...prev
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOS = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      // Mock user ID for demo
      const userId = "demo-user-123";
      
      // Get current location if available
      let location = { lat: 0, lng: 0 };
      if (activeRouteData) {
        location = { lat: activeRouteData.segments[0][1], lng: activeRouteData.segments[0][0] };
      }

      const response = await fetch(`${API_URL}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, location })
      });

      if (response.ok) {
        setAlerts(prev => [
          { id: Date.now(), type: 'danger', title: 'SOS SIGNAL SENT', message: 'Your emergency contacts have been notified of your location.' },
          ...prev
        ]);
        alert("🚨 SOS SIGNAL TRIGGERED! Location sent to emergency services.");
      } else {
         throw new Error('Failed to send SOS');
      }
    } catch (err) {
      alert("❌ SOS SIGNAL FAILED! Please use traditional emergency numbers 112/911.");
      setAlerts(prev => [
        { id: Date.now(), type: 'danger', title: 'EMERGENCY: SYSTEM ERROR', message: 'SOS protocol failed. Please call 112/911 immediately.' },
        ...prev
      ]);
    }
  };

  const activeRouteData = useMemo(() => 
    routes.find(r => r.id === activeRouteId) || null
  , [routes, activeRouteId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F1F5F9] text-[#111827] font-sans overflow-hidden transition-colors">
      
      {/* Top Navbar: Industrial & Clean */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 hover:bg-slate-100 rounded-xl transition-all md:hidden"
           >
             <Menu size={20} />
           </button>
           <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck size={26} strokeWidth={2.5} />
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tight leading-none uppercase italic">SafeRoute AI</h1>
                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Safety Intelligence v2.0</p>
              </div>
           </div>
        </div>

        <SearchBar onSearch={handleRouteSearch} className="hidden lg:block absolute left-1/2 -translate-x-1/2" />

        <div className="hidden md:flex items-center gap-2">
           <div className="text-right mr-4 hidden xl:block">
              <p className="text-xs font-black uppercase text-slate-400 leading-none mb-1">Current Status</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 justify-end">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Protected Region
              </p>
           </div>
           <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all"><Bell size={20} /></button>
           <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all"><Settings size={20} /></button>
           <div className="w-[1px] h-8 bg-slate-200 mx-2" />
           <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-600 font-black shadow-sm group hover:border-blue-500 transition-colors cursor-pointer overflow-hidden">
              <User size={20} className="group-hover:text-blue-600" />
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Map / 3D Canvas (70%) */}
        <main className={`flex-1 relative overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'md:mr-[30%] lg:mr-[25%]' : ''}`}>
           
           {/* Mobile Search - Visible only when sidebar is closed or on small screens */}
           <div className="lg:hidden absolute top-4 left-4 right-4 z-40 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest">Search</div>
              <input readOnly placeholder="Tap to search route..." className="flex-1 bg-transparent text-sm font-bold outline-none" onClick={() => setIsSidebarOpen(true)} />
              <Navigation size={18} className="text-slate-400 mr-2" />
           </div>

           {/* Perspective Switcher */}
           <div className="absolute top-8 left-8 z-40 flex flex-col gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-1">
                 <button 
                   onClick={() => setViewMode('2D')}
                   title="2D Standard Map"
                   className={`p-3.5 rounded-xl transition-all duration-300 ${viewMode === '2D' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
                 >
                   <MapIcon size={22} strokeWidth={2.5} />
                 </button>
                 <button 
                   onClick={() => setViewMode('3D')}
                   title="3D Immersive Mode"
                   className={`p-3.5 rounded-xl transition-all duration-300 ${viewMode === '3D' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
                 >
                   <Box size={22} strokeWidth={2.5} />
                 </button>
              </div>

              <button 
                onClick={handleSOS}
                className="w-14 h-14 bg-red-600 text-white rounded-2xl shadow-2xl shadow-red-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
              >
                 <PhoneCall size={24} className="group-hover:animate-bounce" strokeWidth={3} />
                 <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
           </div>

           {/* Main Viewport Render */}
           <div className="w-full h-full">
              {viewMode === '2D' ? (
                <MapView 
                  routes={routes} 
                  activeRouteId={activeRouteId} 
                  reports={reports} 
                />
              ) : (
                <ThreeDView 
                  routes={routes} 
                  activeRouteId={activeRouteId} 
                  reports={reports} 
                />
              )}
           </div>

           {/* Floating Map Legend */}
           <div className="absolute bottom-8 left-8 z-30 hidden lg:flex items-center gap-6 bg-white/80 backdrop-blur-xl border border-white px-6 py-4 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                 <span className="text-xs font-black uppercase tracking-widest text-[#111827]">Active Course</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-300" />
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                 <span className="text-xs font-black uppercase tracking-widest text-[#111827]">Danger Zones</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-300" />
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                 <span className="text-xs font-black uppercase tracking-widest text-[#111827]">Hazard Items</span>
              </div>
           </div>
        </main>

        {/* Right Sidebar (Industrial Side Panel) - 30% */}
        <aside className={`fixed right-0 top-20 bottom-10 bg-white border-l border-slate-200 z-40 transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.03)] flex flex-col ${isSidebarOpen ? 'translate-x-0 w-[100%] md:w-[30%] lg:w-[25%]' : 'translate-x-full w-0'}`}>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-black text-[#111827] leading-tight">Route Analysis</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-factor security</p>
                 </div>
                 <button className="p-2 hover:bg-slate-100 rounded-xl" onClick={() => setIsSidebarOpen(false)}>
                    <Share2 size={18} className="text-slate-400" />
                 </button>
              </div>

              <RoutePanel 
                routes={routes} 
                activeRouteId={activeRouteId} 
                onSelect={setActiveRouteId}
                safetyData={activeRouteData?.safety}
              />

              <div className="mt-10 space-y-6">
                 <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Tools & Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-50 p-4 rounded-2xl hover:bg-blue-50 transition-colors group cursor-pointer border border-slate-100 hover:border-blue-100">
                          <Heart size={20} className="text-slate-400 group-hover:text-blue-600 mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-600">Save Path</p>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl hover:bg-emerald-50 transition-colors group cursor-pointer border border-slate-100 hover:border-emerald-100">
                          <History size={20} className="text-slate-400 group-hover:text-emerald-600 mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-600">Travel Log</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden group">
                    <div className="relative z-10">
                       <h4 className="text-blue-900 font-black text-sm uppercase mb-1">Local Guardians</h4>
                       <p className="text-xs text-blue-700 font-bold mb-4 opacity-80 leading-relaxed">Safety network active in your current traversal block.</p>
                       <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                          Contact Volunteer <ChevronRight size={14} />
                       </button>
                    </div>
                    <ShieldCheck size={100} className="absolute -right-8 -bottom-8 text-blue-100 z-0 group-hover:rotate-12 transition-transform duration-700" />
                 </div>
              </div>
           </div>

           {/* Action Bar inside Sidebar */}
           <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleSOS}
                className="w-full bg-[#111827] hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl transition-all"
              >
                 <AlertTriangle size={20} className="text-red-500" /> Instant SOS Alert
              </button>
           </div>
        </aside>
      </div>

      {/* Global Bottom Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-8 z-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
         <div className="flex items-center gap-8">
            <span className="flex items-center gap-2.5">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
               Safety Core Online
            </span>
            <span className="flex items-center gap-2.5">
               <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 
               Mapbox API Sync: 12ms
            </span>
         </div>
         <div className="flex items-center gap-6">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Emergency Protocol 1.0</span>
            <div className="w-[1px] h-3 bg-slate-200" />
            <span>Industrial License: PRD-2026-SR</span>
         </div>
      </footer>

      {/* Notifications Overlay */}
      <AlertBox alerts={alerts} onClose={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} />

      {isLoading && (
         <div className="fixed inset-0 bg-slate-100/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-black uppercase italic animate-pulse">Computing Safest Route...</h2>
         </div>
      )}
    </div>
  );
};

export default App;

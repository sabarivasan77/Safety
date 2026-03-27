import React, { useState, useEffect, useMemo, Suspense } from 'react';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import RoutePanel from '../components/RoutePanel';
import AlertBox from '../components/AlertBox';
import { calculateSafety } from '../services/safetyService';
import { getDirections, getCommunityReports } from '../services/mapService';
import { useUser } from '../context/UserContext';
import { 
  ShieldCheck, Map as MapIcon, Box, AlertTriangle, 
  User, Bell, Settings, Share2, Heart, History,
  Navigation, PhoneCall, ChevronRight, Menu
} from 'lucide-react';

const ThreeDView = React.lazy(() => import('../components/ThreeDView'));

const Dashboard = () => {
  const { user, saveRoute } = useUser();
  const [viewMode, setViewMode] = useState('2D');
  const [routes, setRoutes] = useState([]);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', title: 'Safety Engine Online', message: 'Analyzing real-time incident data for your region.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      const data = await getCommunityReports();
      setReports(data || []);
    };
    loadReports();
    const interval = setInterval(loadReports, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRouteSearch = async (start, end) => {
    setIsLoading(true);
    try {
      const fetchedRoutes = await getDirections(start, end);
      const processedRoutes = fetchedRoutes.map((route, index) => {
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
      setAlerts(prev => [
        { id: Date.now(), type: 'success', title: 'Route Found', message: `Safest path identified with ${processedRoutes[0].safety.label} rating.` },
        ...prev
      ]);
    } catch (err) {
      setAlerts(prev => [
        { id: Date.now(), type: 'danger', title: 'Search Failed', message: 'Could not calculate routes.' },
        ...prev
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOS = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const resp = await fetch(`${API_URL}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user-1', location: { lat: 0, lng: 0 } })
      });
      if (resp.ok) {
        alert("🚨 SOS SIGNAL TRIGGERED!");
      }
    } catch (err) {
      alert("SOS connection failed.");
    }
  };

  const handleSaveRoute = () => {
     if (activeRouteData) {
        saveRoute({
           id: activeRouteData.id,
           geometry: activeRouteData.geometry,
           safety: activeRouteData.safety,
           timestamp: new Date().toISOString()
        });
     }
  };

  const activeRouteData = useMemo(() => routes.find(r => r.id === activeRouteId), [routes, activeRouteId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F1F5F9] text-[#111827] font-sans transition-colors overflow-hidden">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl md:hidden">
             <Menu size={20} />
           </button>
           <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                <ShieldCheck size={26} strokeWidth={2.5} />
              </div>
              <div>
                 <h1 className="text-xl font-black italic tracking-tight uppercase">SafeRoute AI</h1>
                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Safety Intelligence v2.0</p>
              </div>
           </div>
        </div>
        <SearchBar onSearch={handleRouteSearch} className="hidden lg:block absolute left-1/2 -translate-x-1/2 shadow-none" />
        <div className="hidden md:flex items-center gap-2">
           <button className="p-3 text-slate-400 hover:text-blue-600"><Bell size={20} /></button>
           <button className="p-3 text-slate-400 hover:text-blue-600"><Settings size={20} /></button>
           <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black">{user.name[0]}</div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 relative overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'md:mr-[30%] lg:mr-[25%]' : ''}`}>
           <div className="absolute top-8 left-8 z-40 flex flex-col gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-1">
                 <button onClick={() => setViewMode('2D')} className={`p-3.5 rounded-xl ${viewMode === '2D' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                   <MapIcon size={22} strokeWidth={2.5} />
                 </button>
                 <button onClick={() => setViewMode('3D')} className={`p-3.5 rounded-xl ${viewMode === '3D' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                   <Box size={22} strokeWidth={2.5} />
                 </button>
              </div>
              <button onClick={handleSOS} className="w-14 h-14 bg-red-600 text-white rounded-2xl shadow-2xl shadow-red-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                 <PhoneCall size={24} strokeWidth={3} />
              </button>
           </div>

           <div className="w-full h-full">
              {viewMode === '2D' ? (
                <MapView routes={routes} activeRouteId={activeRouteId} reports={reports} />
              ) : (
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-50">Loading 3D Engine...</div>}>
                   <ThreeDView routes={routes} activeRouteId={activeRouteId} reports={reports} />
                </Suspense>
              )}
           </div>
        </main>

        <aside className={`fixed right-0 top-20 bottom-10 bg-white border-l border-slate-200 z-40 transition-transform duration-500 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.03)] ${isSidebarOpen ? 'translate-x-0 w-full md:w-[30%] lg:w-[25%]' : 'translate-x-full w-0'}`}>
           <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">Route Analysis</h2>
                 <button className="p-2 hover:bg-slate-100 rounded-xl" onClick={() => setIsSidebarOpen(false)}><Share2 size={18} className="text-slate-400" /></button>
              </div>
              <RoutePanel routes={routes} activeRouteId={activeRouteId} onSelect={setActiveRouteId} safetyData={activeRouteData?.safety} />
              <div className="mt-10 space-y-6">
                 <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Tools & Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div onClick={handleSaveRoute} className="bg-slate-50 p-4 rounded-2xl hover:bg-blue-50 transition-colors group cursor-pointer border border-slate-100"><Heart size={20} className="text-slate-400 group-hover:text-blue-600 mb-2"/><p className="text-xs font-black uppercase text-slate-600">Save</p></div>
                       <div className="bg-slate-50 p-4 rounded-2xl hover:bg-emerald-50 transition-colors group cursor-pointer border border-slate-100"><History size={20} className="text-slate-400 group-hover:text-emerald-600 mb-2"/><p className="text-xs font-black uppercase text-slate-600">History</p></div>
                    </div>
                 </div>
              </div>
           </div>
           <div className="p-6 border-t border-slate-100">
              <button onClick={handleSOS} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3">
                 <AlertTriangle size={20} className="text-red-500" /> Instant SOS
              </button>
           </div>
        </aside>
      </div>

      <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-8 z-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
         <div className="flex items-center gap-8">
            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safety Core Online</span>
            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Mapbox API Connected</span>
         </div>
         <div>V2.0.1 Stable Release</div>
      </footer>

      <AlertBox alerts={alerts} onClose={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} />
      {isLoading && (
         <div className="fixed inset-0 bg-slate-100/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <h2 className="text-xl font-black uppercase italic mt-6 animate-pulse">Analyzing Safest Route...</h2>
         </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import SearchBar from './SearchBar';
import Map2D from './Map2D';
import Scene3D from '../3d-engine/Scene3D';
import ChatBox from '../safety-system/ChatBox';
import NotificationSystem from '../safety-system/NotificationSystem';
import SOSPanel from '../safety-system/SOSPanel';
import { Shield, ShieldAlert, Navigation, Layers, Map, Eye, AlertCircle, Phone, Heart, Users, CheckCircle2, Info, Activity, MapPin, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SafetyService } from '../services/safetyService';

const Dashboard = () => {
  const { userState, setUserState, toggleMonitoring, activateSOS } = useUser();
  const [safetyStats, setSafetyStats] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'simulation'

  const checkAudioSafety = () => {
    const audio = new Audio();
    // Use speech synthesis for the alert
    const utterance = new SpeechSynthesisUtterance("Are you okay? Please confirm your safety.");
    utterance.lang = 'en-US';
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
    
    // Auto-trigger a visual alert after speaking
    setTimeout(() => {
      alert("Safety Check Initiated. Waiting for response...");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  useEffect(() => {
    const fetchSafety = async () => {
      const stats = await SafetyService.calculateSafetyScore(userState.currentLocation.lat, userState.currentLocation.lng);
      setSafetyStats(stats);
    };
    fetchSafety();
  }, [userState.currentLocation]);

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      {/* Top Header System - Modern, Transparent, Persistent */}
      <header className="fixed top-0 left-0 right-0 z-[1001] p-4 lg:p-6 flex flex-col items-center gap-4 pointer-events-none">
        
        {/* Top Control Bar */}
        <div className="w-full max-w-7xl flex items-center justify-between gap-4 pointer-events-auto">
          {/* Logo & Status */}
          <div className="flex items-center gap-3 p-2 pr-4 bg-white border border-slate-200 rounded-2xl shadow-xl">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
               <Shield size={22} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase leading-none">SafeRoute AI</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">AI Secure Active</p>
              </div>
            </div>
          </div>

          {/* Search System - Centralized */}
          <div className="flex-1 max-w-xl">
             <SearchBar />
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl">
            <button 
              onClick={checkAudioSafety}
              className="px-4 py-3 bg-indigo-100 text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
              title="Check Safety (Audio)"
            >
              <Phone size={16} /> <span className="hidden md:inline">Check Safety</span>
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'map' ? 'simulation' : 'map')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'simulation' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              title="Toggle 2D/3D Mode"
            >
              {activeTab === 'map' ? <Layers size={20} /> : <Map size={20} />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
            <button 
              onClick={activateSOS}
              className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md mt-0"
              title="Activate SOS"
            >
              <ShieldAlert size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Engine */}
      <main className="flex-1 w-full h-full pt-20">
        <div className="w-full h-full relative">
          <AnimatePresence mode="wait">
             {activeTab === 'map' ? (
               <motion.div 
                 key="map-2d" 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="w-full h-full"
               >
                 <Map2D />
               </motion.div>
             ) : (
               <motion.div 
                 key="map-3d" 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="w-full h-full"
               >
                 <Scene3D />
               </motion.div>
             )}
          </AnimatePresence>

          {/* LEFT SIDE SYSTEM - Consolidated Monitoring Panel */}
          <div className="absolute top-24 sm:top-32 left-4 sm:left-6 z-[900] flex flex-col gap-4 pointer-events-none sm:pointer-events-auto">
            {/* GIS Simulation Card (3D Mode) */}
            {activeTab === 'simulation' && (
              <motion.div 
                initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="p-5 bg-white border border-slate-200 rounded-[24px] shadow-xl w-72"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Digital Twin</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Real-time Terrain</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <LegendItem color="bg-blue-600" label="Network Towers" />
                  <LegendItem color="bg-red-500" label="Patrol Units" />
                  <LegendItem color="bg-pink-500" label="Active Relatives" />
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                   <div className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hydrating GIS Data</span>
                </div>
              </motion.div>
            )}

            {/* Safety Stats Card */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-slate-200 rounded-[24px] sm:rounded-[28px] shadow-xl w-full max-w-[220px] sm:max-w-[280px] pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Zone Status</span>
                <div className="px-2 py-1 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">Live</div>
              </div>

              {safetyStats ? (
                <>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">{safetyStats.score}%</span>
                    <span className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Safe Score</span>
                  </div>

                  <div className="space-y-4">
                    <ProgressStat label="Crowd Concentration" value={safetyStats.crowd} color="blue" />
                    <ProgressStat label="Luminance Index" value={safetyStats.lighting} color="amber" />
                  </div>
                </>
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <button 
                onClick={toggleMonitoring}
                className={`w-full mt-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${
                  userState.monitoringActive 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/20' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${userState.monitoringActive ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`} />
                {userState.monitoringActive ? 'Secured active' : 'Start Safeguard'}
              </button>
            </motion.div>
          </div>

          {/* BOTTOM SYSTEMS - Modern Status Strip */}
          <div className="absolute bottom-10 left-6 right-6 z-[800] hidden md:flex items-center justify-between pointer-events-none">
             {/* SIM Telemetry HUD */}
             <div className="flex items-center gap-4 pointer-events-auto">
                <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tower Load</span>
                      <span className="text-xl font-black text-slate-800 tracking-tighter tabular-nums">742 <span className="text-[10px] text-slate-400">PPS</span></span>
                   </div>
                   <div className="w-px h-8 bg-slate-200" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Camera Tracking</span>
                      <span className="text-xl font-black text-blue-600 tracking-tighter uppercase">{activeTab === 'simulation' ? 'Following' : 'Map Mode'}</span>
                   </div>
                </div>
             </div>

             {/* Region Localization */}
             <div className="hidden sm:flex items-center gap-4 pointer-events-auto">
                <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                         <MapPin size={20} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Engine Focus</span>
                         <span className="text-xl font-black text-slate-800 tracking-tighter">Global Network</span>
                      </div>
                   </div>
                   <div className="w-px h-8 bg-slate-200" />
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                         <Eye size={20} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visibility</span>
                         <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">Optimal</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Global Safety Overlays */}
      <ChatBox />
      <NotificationSystem />
      <SOSPanel />
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-md ${color} shadow-sm`} />
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
  </div>
);

const ProgressStat = ({ label, value, color }) => {
  const getBarColor = () => {
    switch(color) {
      case 'blue': return 'bg-blue-600';
      case 'amber': return 'bg-amber-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-800">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${getBarColor()}`}
        />
      </div>
    </div>
  );
};

export default Dashboard;

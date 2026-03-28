import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Phone, Users, CheckCircle2, Navigation, AlertCircle, X, ChevronRight } from 'lucide-react';

const SOSPanel = () => {
  const { userState, setUserState, isSOSActive } = useUser();
  const [sentStatus, setSentStatus] = useState('sending'); // 'sending', 'sent'
  
  useEffect(() => {
    if (isSOSActive) {
      setSentStatus('sending');
      const timer = setTimeout(() => setSentStatus('sent'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSOSActive]);

  const deactivateSOS = () => {
    setUserState(prev => ({ 
      ...prev, 
      status: 'Safe', 
      monitoringActive: false 
    }));
  };

  if (!isSOSActive || userState.status !== 'Emergency') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-red-600 z-[9999] p-6 flex flex-col items-center justify-center text-white"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-white animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white animate-pulse" />

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-red-600 mb-8 shadow-[0_0_50px_rgba(255,255,255,0.6)]"
        >
          <ShieldAlert size={48} />
        </motion.div>

        <h2 className="text-4xl font-black text-center mb-2 tracking-tighter">SOS ACTIVE</h2>
        <p className="text-center font-bold text-red-100 max-w-xs mb-8">
          Emergency services and contacts are being notified of your LIVE LOCATION.
        </p>

        {/* Status Card */}
        <div className="w-full max-w-sm glass bg-white/10 border-white/20 rounded-4xl p-6 mb-8 shadow-2xl backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-white/70">SOS STATUS</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${sentStatus === 'sending' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-xs font-black uppercase text-white tracking-widest">{sentStatus}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${sentStatus === 'sent' ? 'bg-green-500/20' : 'bg-white/5'}`}>
              <div className="p-2 bg-white/20 rounded-xl">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">LIVE Location Broadcast</p>
                <p className="text-[10px] text-white/50">{userState.currentLocation.lat}, {userState.currentLocation.lng}</p>
              </div>
              {sentStatus === 'sent' && <CheckCircle2 size={20} className="text-green-400" />}
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${sentStatus === 'sent' ? 'bg-green-500/20' : 'bg-white/5'}`}>
              <div className="p-2 bg-white/20 rounded-xl">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Nearest Police Contacts</p>
                <p className="text-[10px] text-white/50">{userState.nearbyHelp?.[0]?.name || 'Coimbatore Station'}</p>
              </div>
              {sentStatus === 'sent' && <CheckCircle2 size={20} className="text-green-400" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <button className="flex flex-col items-center gap-3 p-6 bg-white rounded-4xl text-red-600 shadow-2xl active:scale-95 transition-all">
            <Phone size={24} className="animate-bounce" />
            <span className="text-xs font-black uppercase tracking-widest">CALL 112</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 bg-green-500 rounded-4xl text-white shadow-2xl active:scale-95 transition-all">
            <CheckCircle2 size={24} />
            <span className="text-xs font-black uppercase tracking-widest">I'M SAFE</span>
          </button>
        </div>

        <button 
          onClick={deactivateSOS}
          className="text-sm font-bold text-white/50 hover:text-white transition-all underline decoration-white/20 underline-offset-8"
        >
          Cancel SOS & Reset Monitoring
        </button>

        {/* Nearby Emergency Points Scroll (Visual Representation) */}
        <div className="mt-12 w-full max-w-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-white/40 mb-4 px-6">Nearby Rescue Points Informed</p>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-6">
            {userState.nearbyHelp?.map(h => (
              <div key={h.id} className="min-w-[140px] p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] font-bold text-white/60 mb-1">{h.type.toUpperCase()}</p>
                <p className="text-[11px] font-black truncate">{h.name}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SOSPanel;

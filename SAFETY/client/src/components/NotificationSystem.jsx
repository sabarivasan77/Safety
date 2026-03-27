import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bell, Shield, ShieldAlert, Check, X, Volume2 } from 'lucide-react';

const NotificationSystem = () => {
  const { userState, timer, resetSafetyTimer, activateSOS } = useUser();
  const [showPrompt, setShowPrompt] = useState(false);
  const [alarmPlayed, setAlarmPlayed] = useState(false);

  // Time constants (in seconds)
  const CHECK_IN_INTERVAL = 300; // 5 mins
  const WARNING_DELAY = 60;     // 1 min post-checkin
  const ALARM_DELAY = 120;     // 2 mins post-checkin
  const SOS_AUTO_DELAY = 180;  // 3 mins post-checkin

  useEffect(() => {
    if (timer >= CHECK_IN_INTERVAL && userState.status === 'Safe') {
      setShowPrompt(true);
    }
    
    // Trigger alarm sound at 2 mins delay
    if (timer >= CHECK_IN_INTERVAL + ALARM_DELAY && !alarmPlayed && userState.status !== 'Emergency') {
      playAlarm();
      setAlarmPlayed(true);
    }

    if (timer < CHECK_IN_INTERVAL) {
      setShowPrompt(false);
      setAlarmPlayed(false);
    }
  }, [timer, userState.status]);

  const playAlarm = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3');
      audio.play();
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  if (!userState.monitoringActive && userState.status !== 'Emergency') return null;

  return (
    <AnimatePresence>
      {/* 5-Min Check-in Alert */}
      {(showPrompt && userState.status !== 'Emergency') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 100 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[2000] p-6 glass rounded-4xl border-l-[12px] border-blue-600 bg-white shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-xl text-slate-800">Safety Check-in</h3>
              <p className="text-sm text-slate-600 font-medium">It's been 5 minutes. Are you doing okay?</p>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={resetSafetyTimer}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Check size={20} /> I'M OKAY
                </button>
                <button 
                  onClick={activateSOS}
                  className="px-6 py-4 bg-red-100 text-red-600 rounded-2xl font-bold border-2 border-red-200 hover:bg-red-200 transition-all"
                >
                  <AlertTriangle size={20} /> SOS
                </button>
              </div>

              {/* Countdown Progress Bar */}
              <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: SOS_AUTO_DELAY, ease: "linear" }}
                  className="h-full bg-blue-500"
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                Auto-SOS in {Math.max(0, SOS_AUTO_DELAY - (timer - CHECK_IN_INTERVAL))}s
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alarm Warning Alert */}
      {(timer >= CHECK_IN_INTERVAL + ALARM_DELAY && userState.status !== 'Emergency') && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-red-600/20 backdrop-blur-sm z-[2001] flex items-center justify-center p-6"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="p-8 bg-white glass rounded-4xl text-center max-w-sm flex flex-col items-center border-4 border-red-500 premium-shadow"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
              <Volume2 size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-red-600 mb-2">URGENT!</h2>
            <p className="text-slate-600 font-bold mb-8">No response detected. Triggering emergency alarm and automated SOS sequence...</p>
            <button 
              onClick={resetSafetyTimer}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200"
            >
              STOP: I'M SAFE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationSystem;

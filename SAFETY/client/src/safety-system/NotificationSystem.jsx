import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bell, ShieldAlert, Check, Volume2 } from 'lucide-react';

const NotificationSystem = () => {
  const { userState, timer, resetSafetyTimer, activateSOS } = useUser();
  const [escalationLevel, setEscalationLevel] = useState(0); 
  // 0 = none, 1 = Check (300s), 2 = Reminder (360s), 3 = Alert (420s), 4 = Alarm (480s)
  
  const [alarmPlayed, setAlarmPlayed] = useState(false);

  const CHECK_IN_INTERVAL = 300; 
  const WARNING_DELAY = 60;     
  const ALERT_DELAY = 120;      
  const ALARM_DELAY = 180;      
  const SOS_AUTO_DELAY = 240;   

  useEffect(() => {
    if (!userState.monitoringActive || userState.status === 'Emergency') {
      setEscalationLevel(0);
      setAlarmPlayed(false);
      return;
    }

    const overtime = timer - CHECK_IN_INTERVAL;

    if (timer < CHECK_IN_INTERVAL) {
      setEscalationLevel(0);
      setAlarmPlayed(false);
    } else if (overtime < WARNING_DELAY) {
      setEscalationLevel(1); // 5 min check
    } else if (overtime < ALERT_DELAY) {
      setEscalationLevel(2); // Reminder
    } else if (overtime < ALARM_DELAY) {
      setEscalationLevel(3); // Alert
    } else if (overtime < SOS_AUTO_DELAY) {
      setEscalationLevel(4); // Alarm
      if (!alarmPlayed) {
        playAlarm();
        setAlarmPlayed(true);
      }
    }
  }, [timer, userState.monitoringActive, userState.status, alarmPlayed]);

  const playAlarm = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3');
      audio.play().catch(e => console.log("Audio play blocked", e));
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  if (!userState.monitoringActive || userState.status === 'Emergency' || escalationLevel === 0) return null;

  const getCardStyle = () => {
    switch(escalationLevel) {
      case 1: return { border: 'border-blue-600', iconColor: 'text-blue-600', bgIcon: 'bg-blue-100', title: 'Safety Check-in', desc: 'Are you doing okay?' };
      case 2: return { border: 'border-amber-500', iconColor: 'text-amber-500', bgIcon: 'bg-amber-100', title: 'Reminder: Are you safe?', desc: 'Please respond. We have not heard from you.' };
      case 3: return { border: 'border-orange-500', iconColor: 'text-orange-500', bgIcon: 'bg-orange-100', title: 'ALERT: No Response', desc: 'Emergency alarms will sound in 1 minute if no response.' };
      default: return { border: 'border-blue-600', iconColor: 'text-blue-600', bgIcon: 'bg-blue-100', title: 'Safety Check-in', desc: 'Are you doing okay?' };
    }
  };

  const style = getCardStyle();

  return (
    <AnimatePresence>
      {/* Levels 1, 2, 3: Bottom Slide-up Overlay */}
      {(escalationLevel >= 1 && escalationLevel <= 3) && (
        <motion.div
          key="prompt"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[2000] p-6 glass rounded-4xl border-l-[12px] ${style.border} bg-white shadow-2xl ${escalationLevel === 3 ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${style.bgIcon} ${style.iconColor}`}>
              <Bell size={24} className={escalationLevel >= 2 ? 'animate-bounce' : ''} />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-xl text-slate-800">{style.title}</h3>
              <p className="text-sm text-slate-600 font-medium">{style.desc}</p>
              
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

              {/* Countdown Progress Bar for SOS */}
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

      {/* Level 4: Full Screen Alarm Alert */}
      {escalationLevel === 4 && (
        <motion.div 
          key="alarm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-red-600/20 backdrop-blur-sm z-[2001] flex items-center justify-center p-6"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="p-8 bg-white glass rounded-4xl text-center max-w-sm flex flex-col items-center border-4 border-red-500 premium-shadow shadow-2xl shadow-red-500/50"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
              <Volume2 size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-red-600 mb-2">URGENT!</h2>
            <p className="text-slate-600 font-bold mb-8">No response detected. Triggering emergency alarm and automated SOS sequence in {Math.max(0, SOS_AUTO_DELAY - (timer - CHECK_IN_INTERVAL))}s...</p>
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

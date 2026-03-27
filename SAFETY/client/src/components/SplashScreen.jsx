import React, { useState, useEffect } from 'react';
import { Shield, Lock, Map, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoading(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 15);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-50" />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-12"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl relative z-10">
          <Shield size={48} strokeWidth={2.5} />
        </div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-12px] border-2 border-blue-100 rounded-[40px] border-dashed"
        />
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">SafeRoute TN</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="px-2 py-0.5 bg-blue-100 text-[10px] font-black text-blue-600 rounded uppercase tracking-widest">v1.2 Production</div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="px-2 py-0.5 bg-green-100 text-[10px] font-black text-green-600 rounded uppercase tracking-widest">Chennai Engine</div>
        </div>
        <p className="text-slate-400 text-sm font-bold tracking-tight max-w-[240px]">Intelligent Safety Navigation for the people of Tamil Nadu.</p>
      </motion.div>

      <div className="w-full max-w-[200px] space-y-3">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${loading}%` }}
            className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initializing...</span>
          <span className="text-[10px] font-black text-blue-600">{loading}%</span>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-3 gap-8 opacity-20 filter grayscale">
           <Zap size={20} />
           <Map size={20} />
           <Lock size={20} />
      </div>

      <p className="absolute bottom-12 text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">Securing Tamil Nadu</p>
    </div>
  );
};

export default SplashScreen;

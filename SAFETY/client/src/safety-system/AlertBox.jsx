import React from 'react';
import { AlertTriangle, Info, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertBox = ({ alerts, onClose }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-4 ${
              alert.type === 'danger' 
                ? 'bg-red-50 border-red-200 text-red-900 shadow-red-500/10'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-500/10'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              alert.type === 'danger' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {alert.type === 'danger' ? <AlertTriangle size={20} /> : <Bell size={20} />}
            </div>

            <div className="flex-1">
               <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                  {alert.title}
               </h4>
               <p className="text-xs font-semibold leading-relaxed">
                  {alert.message}
               </p>
            </div>

            <button 
              onClick={() => onClose(alert.id)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors group"
            >
               <X size={16} className="text-slate-400 group-hover:text-slate-600" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertBox;

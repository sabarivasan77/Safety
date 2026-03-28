import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react';

const SafetyIndicator = ({ score, label, color, className }) => {
  const Icon = score < 30 ? ShieldCheck : score < 60 ? ShieldAlert : ShieldOff;

  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all hover:translate-y-[-2px] shadow-sm ${className}`} 
      style={{ 
        backgroundColor: `${color}10`, // Subtle transparent bg
        borderColor: `${color}30` // Subtle transparent border
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg" 
           style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>

      <div className="flex-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Route Status</h4>
        <div className="flex items-center gap-2">
           <span className="text-xl font-bold" style={{ color: color }}>{label}</span>
           <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              Score: {score}/100
           </span>
        </div>
      </div>
    </div>
  );
};

export default SafetyIndicator;

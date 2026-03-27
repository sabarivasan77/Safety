import React from 'react';
import { Map, Globe } from 'lucide-react';

const ToggleMode = ({ mode, onToggle }) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-3xl shadow-2xl border border-slate-200 flex flex-col gap-2 transition-transform hover:scale-105 active:scale-95 duration-500 ring-4 ring-white">
      <button 
        onClick={() => onToggle('2D')}
        className={`p-3.5 rounded-2xl transition-all duration-500 shadow-sm ${mode === '2D' ? 'bg-blue-600 text-white shadow-blue-500/40 scale-110' : 'text-slate-400 hover:bg-slate-50'}`}
        title="Switch to 2D Map"
      >
        <Map size={24} strokeWidth={3} />
      </button>
      
      <div className="w-full h-[1px] bg-slate-100" />
      
      <button 
        onClick={() => onToggle('3D')}
        className={`p-3.5 rounded-2xl transition-all duration-500 shadow-sm ${mode === '3D' ? 'bg-emerald-500 text-white shadow-emerald-500/40 scale-110' : 'text-slate-400 hover:bg-slate-50'}`}
        title="Switch to 3D Simulation"
      >
        <Globe size={24} strokeWidth={3} />
      </button>
    </div>
  );
};

export default ToggleMode;

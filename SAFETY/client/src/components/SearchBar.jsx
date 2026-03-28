import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, History, Star, Home, X, CheckCircle2, ArrowUpDown, ChevronLeft, Mic, MoreVertical, ShieldCheck } from 'lucide-react';
import { LocationService } from '../services/LocationService';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = () => {
  const { userState, setStart, setDestination, updateLocation } = useUser();
  const [activeInput, setActiveInput] = useState('destination'); // 'start' or 'destination'
  const [query, setQuery] = useState({ start: '', destination: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Sync state names to query strings
  useEffect(() => {
    setQuery({
      start: userState.start?.name || '',
      destination: userState.destination?.name || ''
    });
  }, [userState.start, userState.destination]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch logic with Importance Filtering
  useEffect(() => {
    const currentQuery = query[activeInput];
    const currentPointName = (activeInput === 'start' ? userState.start?.name : userState.destination?.name) || '';
    
    if (currentQuery.trim().length < 2 || currentQuery === currentPointName) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await LocationService.getSuggestions(currentQuery);
      setSuggestions(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeInput]);

  const handleInputChange = (val) => {
    setQuery(prev => ({ ...prev, [activeInput]: val }));
    setShowDropdown(true);
  };

  const handleSelect = (item) => {
    const pointName = item.display_name.split(',')[0];
    const point = { lat: parseFloat(item.lat), lng: parseFloat(item.lon), name: pointName };
    if (activeInput === 'start') setStart(point);
    else setDestination(point);
    setShowDropdown(false);
  };

  const swapPoints = () => {
    const s = userState.start;
    const d = userState.destination;
    setStart(d);
    setDestination(s);
  };

  const useCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude);
        const point = { lat: latitude, lng: longitude, name: 'Current Location' };
        if (activeInput === 'start') setStart(point);
        else setDestination(point);
        setShowDropdown(false);
      });
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto z-[2000]" ref={searchRef}>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-3xl premium-shadow overflow-hidden flex flex-col p-2.5 gap-2 border border-white/40"
      >
        <div className="flex gap-3 items-center">
          <div className="flex flex-col items-center gap-1.5 px-1 py-3 group">
            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${activeInput === 'start' ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`} />
            <div className="w-0.5 h-10 border-l border-dashed border-slate-200" />
            <div className={`w-3.5 h-3.5 flex items-center justify-center transition-colors ${activeInput === 'destination' ? 'text-red-500' : 'text-slate-300'}`}>
               <MapPin size={16} />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="relative">
              <input 
                type="text"
                placeholder="Choose start point"
                value={query.start}
                onFocus={() => { setActiveInput('start'); setShowDropdown(true); }}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeInput === 'start' ? 'bg-white ring-2 ring-blue-500/20 text-slate-800' : 'bg-slate-100/50 text-slate-500'
                }`}
              />
              {query.start && activeInput === 'start' && (
                <button onClick={() => setStart(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search destination in TN"
                value={query.destination}
                onFocus={() => { setActiveInput('destination'); setShowDropdown(true); }}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeInput === 'destination' ? 'bg-white ring-2 ring-blue-500/20 text-slate-800' : 'bg-slate-100/50 text-slate-500'
                }`}
              />
              {query.destination && activeInput === 'destination' && (
                <button onClick={() => setDestination(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1">
             <button 
               onClick={swapPoints}
               className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
               title="Swap points"
             >
               <ArrowUpDown size={20} />
             </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 glass rounded-[40px] overflow-hidden premium-shadow max-h-[420px] overflow-y-auto border border-white/60 mx-1 shadow-2xl"
          >
            <div className="flex gap-2 p-3 bg-blue-50/30 overflow-x-auto scrollbar-hide border-b border-white/20">
              <QuickAction icon={<Navigation size={14} />} label="Live GPS" onClick={useCurrentLocation} />
              <QuickAction icon={<Home size={14} />} label="Home" />
              <QuickAction icon={<ShieldCheck size={14} />} label="Safe Hubs" />
            </div>

            {loading && (
              <div className="p-16 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Importance...</p>
              </div>
            )}

            {!loading && suggestions.length > 0 && suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 transition-all text-left group last:border-0 border-b border-slate-50"
              >
                <div className={`p-3.5 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${item.isTN ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                  <MapPin size={24} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-base text-slate-800 truncate">{item.display_name.split(',')[0]}</p>
                    {item.isTN && <span className="px-1.5 py-0.5 bg-green-100 text-[8px] font-black text-green-700 rounded uppercase tracking-tighter shadow-sm">Verified</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1 font-semibold">{item.display_name.split(',').slice(1).join(',').trim()}</p>
                  
                  {/* Importance Meter */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 flex-1 max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${item.confidence}%` }} className="h-full bg-blue-400 rounded-full" />
                    </div>
                    <span className="text-[9px] font-black text-blue-500">{item.confidence}% Match</span>
                  </div>
                </div>
              </button>
            ))}

            {!loading && query[activeInput] && !suggestions.length && (
              <div className="p-16 text-center text-slate-400 bg-slate-50/50">
                <Search size={32} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm font-black text-slate-800 tracking-tighter">Precise result not found</p>
                <p className="text-[10px] uppercase font-black mt-1 tracking-widest text-slate-400">Expand your search within Tamil Nadu</p>
              </div>
            )}
            
            {!query[activeInput] && (
               <div className="p-6">
                 <p className="px-1 py-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3">Community Safe Points</p>
                 <div className="grid grid-cols-1 gap-2">
                   {[
                     { name: 'Chennai Central Station', sub: 'Hub - 98% Safety Score' },
                     { name: 'Coimbatore Junction', sub: 'Region - 95% Match' },
                     { name: 'Madurai Temple Center', sub: 'Point - Verified Secure' }
                   ].map((hp, i) => (
                     <button key={i} className="w-full flex items-center gap-5 p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all text-left border border-slate-50">
                       <ShieldCheck size={18} className="text-blue-500" />
                       <div>
                         <p className="text-sm font-bold text-slate-800">{hp.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{hp.sub}</p>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 bg-white/80 border border-slate-200/40 rounded-full whitespace-nowrap hover:bg-white hover:border-blue-300 transition-all shadow-sm"
  >
    <div className="text-blue-600">{icon}</div>
    <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">{label}</span>
  </button>
);

export default SearchBar;

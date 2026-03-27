import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { geocode } from '../services/mapService';
import { useDebounce } from '../hooks/useDebounce';
import axios from 'axios';

const SearchBox = ({ onSearch, className }) => {
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [suggestions, setSuggestions] = useState({ source: [], dest: [] });
  const debSource = useDebounce(source, 400);
  const debDest = useDebounce(dest, 400);

  // Use Nominatim for free suggestions
  useEffect(() => {
    if (debSource.length > 2) fetchHints(debSource, 'source');
  }, [debSource]);

  useEffect(() => {
    if (debDest.length > 2) fetchHints(debDest, 'dest');
  }, [debDest]);

  const fetchHints = async (query, type) => {
    try {
      const res = await axios.get(`/nominatim/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      setSuggestions(prev => ({ ...prev, [type]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!source || !dest) { setError('Source and destination are required.'); return; }
    
    setError('');
    setLoading(true);
    try {
      const srcCoord = await geocode(source);
      const destCoord = await geocode(dest);
      if (srcCoord && destCoord) {
        onSearch(srcCoord, destCoord);
      } else { setError('Locations not found.'); }
    } catch { setError('Search failed.'); }
    finally { setLoading(true); } // Keep loading until route calculated
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 z-50 ${className}`}>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 items-center">
         <div className="flex-1 w-full relative">
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20">
               <MapPin size={18} className="text-blue-600 mr-2" />
               <input 
                 value={source} 
                 onChange={(e) => setSource(e.target.value)}
                 placeholder="From: Street, City..." 
                 className="bg-transparent border-none outline-none text-sm w-full font-bold"
               />
               {source && <X size={16} className="text-slate-400 cursor-pointer" onClick={() => setSource('')} />}
            </div>
            {suggestions.source.length > 0 && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] max-h-40 overflow-y-auto">
                  {suggestions.source.map((s, i) => (
                    <div key={i} onClick={() => { setSource(s.display_name); setSuggestions(p => ({ ...p, source: [] })); }} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer text-[10px] font-black uppercase text-slate-800 border-b border-slate-50 last:border-b-0">
                       {s.display_name}
                    </div>
                  ))}
               </div>
            )}
         </div>

         <div className="flex-1 w-full relative">
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20">
               <MapPin size={18} className="text-emerald-600 mr-2" />
               <input 
                 value={dest} 
                 onChange={(e) => setDest(e.target.value)}
                 placeholder="To: Place, Landmark..." 
                 className="bg-transparent border-none outline-none text-sm w-full font-bold"
               />
               {dest && <X size={16} className="text-slate-400 cursor-pointer" onClick={() => setDest('')} />}
            </div>
            {suggestions.dest.length > 0 && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] max-h-40 overflow-y-auto">
                  {suggestions.dest.map((s, i) => (
                    <div key={i} onClick={() => { setDest(s.display_name); setSuggestions(p => ({ ...p, dest: [] })); }} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer text-[10px] font-black uppercase text-slate-800 border-b border-slate-50 last:border-b-0">
                       {s.display_name}
                    </div>
                  ))}
               </div>
            )}
         </div>

         <button 
           type="submit" 
           className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black uppercase text-[11px] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:bg-blue-700 active:scale-95"
         >
           {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
           Search Route
         </button>
      </form>
    </div>
  );
};

export default SearchBox;

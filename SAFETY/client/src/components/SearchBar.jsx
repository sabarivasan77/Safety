import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { geocode } from '../services/mapService';
import { useDebounce } from '../hooks/useDebounce';
import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const SearchBar = ({ onSearch, className }) => {
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  
  const debouncedSource = useDebounce(source, 300);
  const debouncedDest = useDebounce(dest, 300);

  // Fetch suggestions for source
  useEffect(() => {
    if (debouncedSource.length > 2) {
      fetchSuggestions(debouncedSource, setSourceSuggestions);
    } else {
      setSourceSuggestions([]);
    }
  }, [debouncedSource]);

  // Fetch suggestions for dest
  useEffect(() => {
    if (debouncedDest.length > 2) {
      fetchSuggestions(debouncedDest, setDestSuggestions);
    } else {
      setDestSuggestions([]);
    }
  }, [debouncedDest]);

  const fetchSuggestions = async (query, setter) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`;
      const res = await axios.get(url);
      setter(res.data.features || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRouteSearch = async (e) => {
    if (e) e.preventDefault();
    if (!source || !dest) {
      setError('Both source and destination are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const srcCoord = await geocode(source);
      const destCoord = await geocode(dest);
      if (srcCoord && destCoord) {
        onSearch(srcCoord, destCoord);
      } else {
        setError('Locations not found.');
      }
    } catch {
      setError('Failed to calculate route.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (text, type) => {
    if (type === 'source') {
      setSource(text);
      setSourceSuggestions([]);
    } else {
      setDest(text);
      setDestSuggestions([]);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 relative ${className}`}>
      <form onSubmit={handleRouteSearch} className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex-1 relative">
           <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
             <MapPin size={18} className="text-blue-500 mr-2" />
             <input 
               type="text" 
               value={source}
               onChange={(e) => setSource(e.target.value)}
               placeholder="From: Current location..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium"
             />
             {source && <X size={16} className="text-slate-400 cursor-pointer" onClick={() => setSource('')} />}
           </div>
           
           {sourceSuggestions.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] p-2">
                {sourceSuggestions.map((s) => (
                  <div key={s.id} onClick={() => handleSelectSuggestion(s.place_name, 'source')} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-3">
                     <Navigation size={14} className="text-slate-400" /> {s.place_name}
                  </div>
                ))}
             </div>
           )}
        </div>

        <div className="flex-1 relative">
           <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
             <MapPin size={18} className="text-emerald-500 mr-2" />
             <input 
               type="text" 
               value={dest}
               onChange={(e) => setDest(e.target.value)}
               placeholder="To: Destination..." 
               className="bg-transparent border-none outline-none text-sm w-full font-medium"
             />
             {dest && <X size={16} className="text-slate-400 cursor-pointer" onClick={() => setDest('')} />}
           </div>

           {destSuggestions.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] p-2">
                {destSuggestions.map((s) => (
                  <div key={s.id} onClick={() => handleSelectSuggestion(s.place_name, 'dest')} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-3">
                     <Navigation size={14} className="text-slate-400" /> {s.place_name}
                  </div>
                ))}
             </div>
           )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          <span>{loading ? 'Analyzing...' : 'Search'}</span>
        </button>
      </form>
      {error && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase">⚠️ {error}</p>}
    </div>
  );
};

export default SearchBar;

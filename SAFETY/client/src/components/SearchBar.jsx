import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { geocode } from '../services/mapService';

const SearchBar = ({ onSearch, className }) => {
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRouteSearch = async (e) => {
    e.preventDefault();
    if (!source || !dest) {
      setError('Please provide both source and destination.');
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
        setError('Location not found. Try a different search terms.');
      }
    } catch (err) {
      setError('Failed to fetch locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 ${className}`}>
      <form onSubmit={handleRouteSearch} className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex-1 flex items-center bg-slate-50 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
          <MapPin size={18} className="text-blue-500 mr-2" />
          <input 
            type="text" 
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="From: Current location, street..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
          {source && <X size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setSource('')} />}
        </div>

        <div className="flex-1 flex items-center bg-slate-50 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
          <MapPin size={18} className="text-emerald-500 mr-2" />
          <input 
            type="text" 
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="To: Destination name, landmark..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
          {dest && <X size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setDest('')} />}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:bg-slate-300"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          <span>{loading ? 'Analyzing...' : 'SafeRoute'}</span>
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-2 ml-2 font-semibold">⚠️ {error}</p>}
    </div>
  );
};

export default SearchBar;

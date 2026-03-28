import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Shield, MapPin, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { SafetyService } from '../services/safetyService';

const PRE_BUILT_QUESTIONS = [
  { id: 1, text: "Best route from A to B?", type: 'route' },
  { id: 2, text: "Is this area safe?", type: 'safety' },
  { id: 3, text: "What should I do in this situation?", type: 'advice' },
  { id: 4, text: "Nearby safe places?", type: 'help' }
];

const ChatBox = () => {
  const { userState, activateSOS } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm SafeRoute Assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (text, type = 'query') => {
    if (!text) return;
    
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }]);
    setInput('');

    // Simulate AI response
    setTimeout(async () => {
      let response = "I'm analyzing the data for you...";
      
      if (type === 'safety' || text.toLowerCase().includes('safe')) {
        const safety = await SafetyService.calculateSafetyScore(userState.currentLocation.lat, userState.currentLocation.lng);
        response = `Safety Analysis for your current location: This area has a safety score of ${safety.score}%. ${safety.lighting < 50 ? 'Lighting is low here, stay on main roads.' : 'Well-lit area.'} ${safety.crowd > 60 ? 'Moderate crowd detected - good for safety.' : 'Low crowd density.'}`;
      } else if (type === 'help' || text.toLowerCase().includes('help') || text.toLowerCase().includes('police')) {
        const help = await SafetyService.getNearbyHelp(userState.currentLocation.lat, userState.currentLocation.lng, 'police');
        response = `Nearby Help: I found ${help.length} police stations within 5km. The closest one is ${help[0]?.name || 'a station'} at ${help[0]?.address.split(',')[0]}.`;
      } else if (type === 'route' || text.toLowerCase().includes('route')) {
        response = userState.selectedRoute 
          ? `You are currently on the ${userState.selectedRoute.label}. It is ${Math.round(userState.selectedRoute.safetyScore)}% safe and will take ${Math.round(userState.selectedRoute.duration / 60)} minutes.`
          : "Please search for a destination first, and I will recommend the safest path.";
      } else if (type === 'advice' || text.toLowerCase().includes('situation')) {
        response = "If you feel unsafe: 1. Head to the nearest petrol bunk or police station. 2. Activate SOS to share live location. 3. Call 112 if immediate danger. Stay in well-lit areas with crowds.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'ai' }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-blue-700 transition-all z-[1001]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[90%] max-w-[360px] h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl z-[1001] flex flex-col border border-slate-100"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">SafeRoute Assistant</h3>
                  <p className="text-[10px] text-white/70">System: AI Engine v1.0</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50">
              {messages.map(m => (
                <div 
                  key={m.id} 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.sender === 'ai' 
                      ? 'bg-white border border-slate-100 self-start text-slate-700 shadow-sm' 
                      : 'bg-primary text-white self-end shadow-md shadow-primary/20'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            <div className="p-2 bg-slate-50 flex gap-2 overflow-x-auto border-t border-slate-100">
              {PRE_BUILT_QUESTIONS.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSend(q.text, q.type)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  {q.text}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask anything about safety..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button 
                onClick={() => handleSend(input)}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                disabled={!input}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;

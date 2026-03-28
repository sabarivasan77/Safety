import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  // Assume UserContext can hold auth token/info
  // const { setAuthData } = useUser();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const enterDemoMode = () => {
    localStorage.setItem('token', 'demo-mode-token');
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setIsLogin(true);
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (!err.response || err.code === 'ERR_NETWORK') {
        setError('Server offline. Use Demo Mode below to explore the app.');
      } else {
        setError(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-400/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Auth Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden relative z-10 p-8 sm:p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/30">
            <Shield size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            SafeRoute AI
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
            {isLogin ? 'Access Navigation Core' : 'Initialize Profile'}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mb-6 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
            <ShieldCheck size={20} className="text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full py-4 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-4 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Secure Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-4 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isLogin ? 'Establish Link' : 'Register Profile')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Demo Mode */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={enterDemoMode}
            className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            <Zap size={16} /> Enter Demo Mode (No Login)
          </button>
        </div>

        <div className="mt-5 text-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            {isLogin ? 'Create Secure Profile' : 'Return to Login'}
          </button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="fixed bottom-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pointer-events-none">
        Secure Encryption Active
      </div>
    </div>
  );
};

export default AuthPage;

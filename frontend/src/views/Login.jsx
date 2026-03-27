import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MdLocalParking, MdPerson, MdLock } from "react-icons/md";
import GlassCard from '../components/GlassCard';
import BASE_URL from '../api.js';


const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Authenticating...');

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      toast.success('Login Successful!', { id: toastId });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen anim-gradient flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <GlassCard className="w-full max-w-md p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4"
          >
            <MdLocalParking className="text-white text-4xl" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the admin panel.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">Username</label>
            <div className="relative">
              <MdPerson className="absolute left-3 top-3.5 text-gray-400 text-xl" />
              <input
                type="text"
                name="username"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="admin_user"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">Password</label>
            <div className="relative">
              <MdLock className="absolute left-3 top-3.5 text-gray-400 text-xl" />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-400 ml-1">Password must be at least 8 characters.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Don't have an account? <span onClick={() => navigate('/register')} className="text-blue-600 font-bold cursor-pointer hover:underline">Register</span></p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
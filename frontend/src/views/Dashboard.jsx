import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdDashboard, MdLocalParking, MdAttachMoney, MdDirectionsCar, MdQueryStats, MdLogout } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import BASE_URL from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSlots: 0, freeSlots: 0, filledSlots: 0,
    todaysEntry: 0, todaysRevenue: 0, totalProfit: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("[FRONTEND DASHBOARD] Received Data:", res.data);
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };
    fetchStats();
    // Refresh every 5s to keep in sync
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color, delay }) => (
    <GlassCard delay={delay} className="flex items-center justify-between p-6 relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20 ${color} group-hover:scale-150 transition-transform duration-500`} />
      <div>
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-4xl font-bold text-gray-800 mt-2">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
        {icon}
      </div>
    </GlassCard>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen anim-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</h1>
            <p className="text-gray-500 font-medium">Real-time Overview</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link to="/customer-details" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.05 }} className="px-5 py-3 bg-white/50 border border-white/40 rounded-xl text-blue-600 font-bold hover:bg-white shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                <MdQueryStats /> All Customer Details
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.05 }} onClick={handleLogout} className="px-4 py-3 bg-white/50 border border-white/40 rounded-xl text-gray-600 font-bold hover:bg-white hover:text-red-500 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
              <MdLogout /> Logout
            </motion.button>
            <Link to="/slot-allocation" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 w-full sm:w-auto">
                + Allocate Slot
              </motion.button>
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Slots" value={stats.totalSlots} icon={<MdLocalParking size={28} />} color="bg-gradient-to-br from-blue-400 to-blue-600" delay={0.1} />
          <StatCard title="Free Slots" value={stats.freeSlots} icon={<MdDirectionsCar size={28} />} color="bg-gradient-to-br from-emerald-400 to-emerald-600" delay={0.2} />
          <StatCard title="Filled Slots" value={stats.filledSlots} icon={<MdDirectionsCar size={28} />} color="bg-gradient-to-br from-rose-400 to-rose-600" delay={0.3} />
          <StatCard title="Today's Entry" value={stats.todaysEntry} icon={<MdQueryStats size={28} />} color="bg-gradient-to-br from-purple-400 to-purple-600" delay={0.4} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard title="Today's Revenue" value={`₹${stats.todaysRevenue}`} icon={<MdAttachMoney size={28} />} color="bg-gradient-to-br from-teal-400 to-teal-600" delay={0.5} />
          <StatCard title="Total Profit" value={`₹${stats.totalProfit}`} icon={<MdAttachMoney size={28} />} color="bg-gradient-to-br from-amber-400 to-amber-600" delay={0.6} />
        </div>

        {/* Navigation Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/slot-details/all" className="contents">
            <GlassCard className="hover:bg-white/80 transition-colors cursor-pointer group flex flex-col items-center justify-center py-10" delay={0.7}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform"><MdDashboard size={32} /></div>
              <h3 className="text-xl font-bold text-gray-800">Slot Grid View</h3>
              <p className="text-gray-500 text-sm mt-1">Manage Availability</p>
            </GlassCard>
          </Link>
          <Link to="/deallocate-slot" className="contents">
            <GlassCard className="hover:bg-white/80 transition-colors cursor-pointer group flex flex-col items-center justify-center py-10" delay={0.8}>
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform"><MdLogout size={32} /></div>
              <h3 className="text-xl font-bold text-gray-800">Deallocate Slot</h3>
              <p className="text-gray-500 text-sm mt-1">Process Exit & Payment</p>
            </GlassCard>
          </Link>
          <Link to="/vehicle-config" className="contents">
            <GlassCard className="hover:bg-white/80 transition-colors cursor-pointer group flex flex-col items-center justify-center py-10" delay={0.9}>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform"><MdLocalParking size={32} /></div>
              <h3 className="text-xl font-bold text-gray-800">Configuration</h3>
              <p className="text-gray-500 text-sm mt-1">Manage Slot Count</p>
            </GlassCard>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
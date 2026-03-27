import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { MdPeople, MdLocalParking, MdSearch, MdDelete, MdLogout, MdHistory } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import { motion, AnimatePresence } from 'framer-motion';
import BASE_URL from '../api';

const CustomerDetails = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [activeRes, historyRes] = await Promise.allSettled([
                axios.get(`${BASE_URL}/api/allocations`, config),
                axios.get(`${BASE_URL}/api/history`, config)
            ]);

            let combined = [];
            if (activeRes.status === 'fulfilled' && activeRes.value.data.success) {
                combined = [...combined, ...activeRes.value.data.data.map(item => ({ ...item, type: 'active' }))];
            }
            if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
                combined = [...combined, ...historyRes.value.data.data.map(item => ({ ...item, type: 'history' }))];
            }

            combined.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
            setCustomers(combined);
        } catch (error) {
            console.error("Error fetching customer data", error);
            toast.error("Failed to sync customer registry");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Sync every 10s
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id, type) => {
        if (!window.confirm("Permanent deletion of this record?")) return;

        const toastId = toast.loading("Processing...");
        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'active' ? `allocations/${id}` : `history/${id}`;
            await axios.delete(`${BASE_URL}/api/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Record purged", { id: toastId });
            fetchData();
        } catch (error) {
            toast.error("Deletion failed", { id: toastId });
        }
    };

    const filteredCustomers = customers.filter(c =>
        (c.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.vehicleNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.ownerPhone || "").includes(searchTerm)
    );

    if (loading) return (
        <div className="min-h-screen anim-gradient flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="font-bold text-gray-600 uppercase tracking-widest animate-pulse">Syncing Database...</p>
        </div>
    );

    return (
        <div className="min-h-screen anim-gradient p-6 relative">
            <BackArrow />
            <Toaster position="top-center" />

            <div className="max-w-7xl mx-auto">
                {/* Header - Matching Dashboard Style */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="text-center md:text-left flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <MdPeople size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Customer Records</h1>
                            <p className="text-gray-500 font-medium tracking-tight">Consolidated Session Logistics</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search registry..."
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/40 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Unified Table View - Desktop */}
                <div className="hidden lg:block">
                    <GlassCard className="p-0 overflow-hidden border-white/40 shadow-2xl rounded-3xl" delay={0.1}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white">
                                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest">Identify</th>
                                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest">Communication</th>
                                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest">Asset Tracking</th>
                                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest">Logistics</th>
                                    <th className="py-6 px-8 text-xs font-black uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/30 bg-white/40 backdrop-blur-md">
                                <AnimatePresence mode='popLayout'>
                                    {filteredCustomers.length > 0 ? filteredCustomers.map((c) => (
                                        <motion.tr
                                            key={c._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="hover:bg-blue-600/[0.05] transition-colors group"
                                        >
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${c.type === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`}></div>
                                                    <span className="font-extrabold text-gray-800 tracking-tight text-lg">{c.ownerName}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-gray-600 font-bold font-mono">{c.ownerPhone}</td>
                                            <td className="py-6 px-8">
                                                <span className="px-4 py-2 bg-white border border-gray-200 text-blue-800 rounded-xl font-black uppercase text-sm shadow-sm group-hover:border-blue-300 group-hover:scale-105 transition-all inline-block">
                                                    {c.vehicleNumber}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-2 text-indigo-700 font-black mb-1">
                                                    <MdLocalParking size={18} />
                                                    {c.slotNumber || c.slotId?.slotNumber || 'N/A'}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                                    {new Date(c.entryTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-center text-gray-400">
                                                <motion.button
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => handleDelete(c._id, c.type)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdDelete size={22} />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 shadow-inner">
                                                        <MdHistory size={40} />
                                                    </div>
                                                    <p className="text-gray-400 font-black tracking-widest uppercase text-sm italic">No records found matching current filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </GlassCard>
                </div>

                {/* Mobile/Responsive View - Cards */}
                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredCustomers.map((c) => (
                            <motion.div
                                key={c._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative active:scale-[0.98] transition-all"
                            >
                                <GlassCard className="p-6 border-white/40 shadow-xl overflow-hidden group">
                                    <div className={`absolute top-0 right-0 px-4 py-1.5 ${c.type === 'active' ? 'bg-emerald-500' : 'bg-slate-400'} text-white text-[10px] font-black uppercase rounded-bl-xl shadow-md`}>
                                        {c.type === 'active' ? 'Active' : 'History'}
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xl">
                                            {(c.ownerName || "C")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-800 leading-none">{c.ownerName}</h3>
                                            <p className="text-sm text-gray-500 font-bold mt-1">{c.ownerPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100/50">
                                        <div className="flex flex-col gap-2">
                                            <span className="px-3 py-1.5 bg-white border border-gray-100 text-blue-700 rounded-lg font-black text-xs uppercase shadow-sm">
                                                {c.vehicleNumber}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-indigo-700 font-black text-sm">
                                                <MdLocalParking size={18} /> Slot {c.slotNumber || c.slotId?.slotNumber || 'N/A'}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(c._id, c.type)} className="p-4 bg-red-50 text-red-500 rounded-2xl active:bg-red-500 active:text-white transition-all">
                                            <MdDelete size={22} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                                        {new Date(c.entryTime).toLocaleString()}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <p className="mt-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Verified Parking Audit System &bull; Secure Ledger Access</p>
            </div>
        </div>
    );
};

export default CustomerDetails;

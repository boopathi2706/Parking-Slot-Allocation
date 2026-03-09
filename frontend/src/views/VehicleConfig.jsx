import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { MdTwoWheeler, MdDirectionsCar, MdLocalShipping } from "react-icons/md";
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import { motion } from 'framer-motion';

const ConfigInput = ({ label, icon, name, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 font-bold text-gray-700">
      <span className="text-blue-500 text-xl">{icon}</span> {label}
    </label>
    <input
      type="number"
      name={name}
      min="0"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-4 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-bold"
    />
  </div>
);

const VehicleConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ twoWheeler: 0, fourWheeler: 0, bigVehicle: 0 });

  const handleChange = (e) => setConfig({ ...config, [e.target.name]: parseInt(e.target.value) || 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[FRONTEND VEHICLE CONFIG] Submitting config:", config);
    const toastId = toast.loading('Initializing Slots...');
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/user/vehicle-config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Slots Configured Successfully!', { id: toastId });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to configure slots', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen anim-gradient flex items-center justify-center p-6 relative">
      <BackArrow />
      <Toaster position="top-center" />
      <GlassCard className="w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Slot Configuration</h2>
        <p className="text-gray-500 mb-8">Set the capacity for each vehicle type.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ConfigInput
            label="2-Wheelers"
            icon={<MdTwoWheeler />}
            name="twoWheeler"
            placeholder="e.g. 50"
            value={config.twoWheeler}
            onChange={handleChange}
          />
          <ConfigInput
            label="4-Wheelers"
            icon={<MdDirectionsCar />}
            name="fourWheeler"
            placeholder="e.g. 30"
            value={config.fourWheeler}
            onChange={handleChange}
          />
          <ConfigInput
            label="Big Vehicles"
            icon={<MdLocalShipping />}
            name="bigVehicle"
            placeholder="e.g. 10"
            value={config.bigVehicle}
            onChange={handleChange}
          />

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 mt-4"
          >
            Save Configuration
          </motion.button>
        </form>
      </GlassCard>
    </div>
  );
};

export default VehicleConfig;
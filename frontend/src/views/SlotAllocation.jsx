import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import OTPModal from '../components/OTPModal';
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import { motion } from 'framer-motion';

const SlotAllocation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ownerName: '', ownerPhone: '', vehicleNumber: '', vehicleType: '2W', slotNumber: '' });
  const [showOtp, setShowOtp] = useState(false);
  const [allocationId, setAllocationId] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Checking availability...");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://parking-slot-allocation.onrender.com/api/allocations/allocate', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllocationId(res.data.allocationId);
      toast.success(`OTP Sent! (Mock: ${res.data.mockOtp})`, { id: toastId, duration: 5000 });
      setShowOtp(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Allocation Failed", { id: toastId });
    }
  };

  const handleVerifyOtp = async (otp) => {
    const toastId = toast.loading("Verifying OTP...");
    try {
      // 1. Verify Allocation
      const token = localStorage.getItem('token');
      await axios.post('https://parking-slot-allocation.onrender.com/api/allocations/verify-allocate', { allocationId, otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Allocation Successful!", { id: toastId });
      setShowOtp(false);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error(error);
      toast.error("Invalid OTP or Error Updating Stats", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen anim-gradient flex items-center justify-center p-4 relative">
      <BackArrow />
      <Toaster position="top-center" />
      <OTPModal isOpen={showOtp} onClose={() => setShowOtp(false)} onSubmit={handleVerifyOtp} title="Verify Allocation" />

      <GlassCard className="w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">New Allocation</h2>

        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Owner Name</label>
            <input name="ownerName" value={formData.ownerName} required onChange={handleChange} className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input name="ownerPhone" value={formData.ownerPhone} required onChange={handleChange} className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none" placeholder="9876543210" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle No</label>
              <input name="vehicleNumber" value={formData.vehicleNumber} required onChange={handleChange} className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none uppercase" placeholder="AB-12" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none">
                <option value="2W">2-Wheeler</option>
                <option value="4W">4-Wheeler</option>
                <option value="Big">Big Vehicle</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Slot Number</label>
            <input name="slotNumber" value={formData.slotNumber} required onChange={handleChange} className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none uppercase" placeholder="e.g. 2W-1" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 mt-4"
          >
            Proceed to Verify
          </motion.button>
        </form>
      </GlassCard>
    </div>
  );
};

export default SlotAllocation;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import OTPModal from '../components/OTPModal';
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import { motion } from 'framer-motion';
import BASE_URL from '../api';

const DeallocateSlot = () => {
  const navigate = useNavigate();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [preview, setPreview] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Calculating...");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/api/allocations/calculate-exit`, { vehicleNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreview(res.data);
      toast.success(`Bill Calculated! OTP: ${res.data.mockOtp}`, { id: toastId, duration: 6000 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Vehicle not found", { id: toastId });
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExit = async (otp) => {
    const toastId = toast.loading("Verifying...");
    try {
      // 1. Complete Exit
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/allocations/complete-exit`, {
        vehicleNumber: preview.data.vehicleNumber,
        otp,
        amount: preview.data.amount,
        durationHours: preview.data.durationHours
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Deallocation Successful!", { id: toastId });
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
      <OTPModal isOpen={showOtp} onClose={() => setShowOtp(false)} onSubmit={handleConfirmExit} title="Verify Exit" description="Enter OTP to confirm payment and deallocation." />

      <div className="w-full max-w-lg space-y-6">
        <GlassCard className="p-8">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600 mb-6">Deallocate Slot</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="flex-1 p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none uppercase"
              placeholder="Enter Vehicle No"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              disabled={loading} type="submit"
              className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-500/30 disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </motion.button>
          </form>
        </GlassCard>

        {preview && (
          <GlassCard className="p-8 border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Bill Preview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle Number</span>
                <span className="font-bold">{preview.data.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Slot</span>
                <span className="font-bold">{preview.data.slotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-bold">{preview.data.durationHours} Hours ({preview.data.days} Days)</span>
              </div>
              <div className="flex justify-between text-lg pt-4 border-t mt-2">
                <span className="text-gray-800 font-bold">Total Amount</span>
                <span className="font-bold text-emerald-600 text-xl">₹{preview.data.amount}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowOtp(true)}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30"
            >
              Confirm Payment & Exit
            </motion.button>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default DeallocateSlot;
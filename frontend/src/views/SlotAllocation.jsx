import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import OTPModal from '../components/OTPModal';
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import { motion } from 'framer-motion';
import { MdLocalParking } from 'react-icons/md';
import BASE_URL from '../api.js';

const SlotAllocation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '', ownerPhone: '', vehicleNumber: '', vehicleType: '2W', slotNumber: ''
  });
  const [freeSlots, setFreeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [allocationId, setAllocationId] = useState(null);

  // Fetch free slots whenever vehicle type changes
  useEffect(() => {
    const fetchFreeSlots = async () => {
      setLoadingSlots(true);
      setFormData(prev => ({ ...prev, slotNumber: '' })); // reset slot selection
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/slots/free?type=${formData.vehicleType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFreeSlots(res.data);
      } catch (err) {
        toast.error('Failed to load free slots');
        setFreeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchFreeSlots();
  }, [formData.vehicleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vehicleNumber') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    // Vehicle Number Pattern Validation (e.g. TN-01 A 1234)
    const vehiclePattern = /^[A-Z]{2}-[0-9]{2}\s[A-Z]\s[0-9]{3,4}$/i;
    if (!vehiclePattern.test(formData.vehicleNumber)) {
      toast.error('Vehicle number is not in Indian vehicle number format (e.g. TN-01 A 1234)');
      return;
    }

    if (!formData.slotNumber) {
      toast.error('Please select a slot');
      return;
    }
    const toastId = toast.loading('Checking availability...');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/api/allocations/allocate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllocationId(res.data.allocationId);
      toast.success(`OTP Sent! (Mock: ${res.data.mockOtp})`, { id: toastId, duration: 6000 });
      setShowOtp(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Allocation Failed', { id: toastId });
    }
  };

  const handleVerifyOtp = async (otp) => {
    const toastId = toast.loading('Verifying OTP...');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/allocations/verify-allocate`, { allocationId, otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Allocation Successful!', { id: toastId });
      setShowOtp(false);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP', { id: toastId });
    }
  };

  const inputCls = "w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all";
  const labelCls = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <div className="min-h-screen anim-gradient flex items-center justify-center p-4 relative">
      <BackArrow />
      <Toaster position="top-center" />
      <OTPModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onSubmit={handleVerifyOtp}
        title="Verify Allocation"
      />

      <GlassCard className="w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
          New Allocation
        </h2>

        <form onSubmit={handleRequestOtp} className="space-y-4">
          {/* Owner Name */}
          <div>
            <label className={labelCls}>Owner Name</label>
            <input
              name="ownerName" value={formData.ownerName} required
              onChange={handleChange} className={inputCls} placeholder="John Doe"
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              name="ownerPhone" value={formData.ownerPhone} required
              onChange={handleChange} className={inputCls} placeholder="9876543210"
            />
          </div>

          {/* Vehicle Number + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vehicle No</label>
              <input
                name="vehicleNumber" value={formData.vehicleNumber} required
                onChange={handleChange} className={`${inputCls} uppercase`} placeholder="TN-01 A 1234"
              />
            </div>
            <div>
              <label className={labelCls}>Vehicle Type</label>
              <select
                name="vehicleType" value={formData.vehicleType}
                onChange={handleChange} className={inputCls}
              >
                <option value="2W">2-Wheeler</option>
                <option value="4W">4-Wheeler</option>
                <option value="Big">Big Vehicle</option>
              </select>
            </div>
          </div>

          {/* Slot Number - Dynamic Dropdown */}
          <div>
            <label className={labelCls}>
              Slot Number
              <span className="ml-2 text-xs font-medium text-emerald-600">
                ({freeSlots.length} free slot{freeSlots.length !== 1 ? 's' : ''} available)
              </span>
            </label>

            {loadingSlots ? (
              <div className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl text-gray-400 text-sm flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Loading available slots...
              </div>
            ) : freeSlots.length === 0 ? (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2">
                <MdLocalParking className="text-lg" />
                No free {formData.vehicleType} slots available
              </div>
            ) : (
              <select
                name="slotNumber"
                value={formData.slotNumber}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">— Select a free slot —</option>
                {freeSlots.map(slot => (
                  <option key={slot._id} value={slot.slotNumber}>
                    {slot.slotNumber}
                  </option>
                ))}
              </select>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={freeSlots.length === 0 || loadingSlots}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Verify
          </motion.button>
        </form>
      </GlassCard>
    </div>
  );
};

export default SlotAllocation;
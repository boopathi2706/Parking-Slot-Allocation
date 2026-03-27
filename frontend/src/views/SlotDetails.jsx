import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import SlotCard from '../components/SlotCard';
import BASE_URL from '../api';


const SlotDetails = () => {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addForm, setAddForm] = useState({ twoWheeler: '', fourWheeler: '', bigVehicle: '' });
  const [adding, setAdding] = useState(false);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlots(res.data);
    } catch (error) {
      toast.error("Failed to fetch slots");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    const toastId = toast.loading("Updating status...");
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/slots/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Slot marked as ${newStatus}`, { id: toastId });
      fetchSlots();
    } catch (error) {
      toast.error("Update failed", { id: toastId });
    }
  };

  const handleAddSlots = async (e) => {
    e.preventDefault();
    const tw = parseInt(addForm.twoWheeler) || 0;
    const fw = parseInt(addForm.fourWheeler) || 0;
    const bv = parseInt(addForm.bigVehicle) || 0;
    if (tw + fw + bv === 0) {
      toast.error("Please enter at least 1 slot to add.");
      return;
    }
    setAdding(true);
    const toastId = toast.loading("Adding slots...");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/api/slots/add`,
        { twoWheeler: tw, fourWheeler: fw, bigVehicle: bv },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message, { id: toastId });
      setAddForm({ twoWheeler: '', fourWheeler: '', bigVehicle: '' });
      setShowAddPanel(false);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add slots", { id: toastId });
    } finally {
      setAdding(false);
    }
  };

  const filteredSlots = filter === 'All' ? slots : slots.filter(s => s.type === filter);

  return (
    <div className="min-h-screen anim-gradient p-6 relative">
      <BackArrow />
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto pt-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Slot Grid</h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <GlassCard className="p-2 flex gap-2 !rounded-xl !border-blue-100">
              {['All', '2W', '4W', 'Big'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filter === f ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </GlassCard>

            {/* Add Slots Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 text-sm"
            >
              <MdAdd className="text-lg" />
              Add Slots
              {showAddPanel ? <MdExpandLess /> : <MdExpandMore />}
            </motion.button>
          </div>
        </header>

        {/* Add Extra Slots Panel */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="mb-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-1">Add Extra Slots</h2>
                <p className="text-xs text-gray-400 mb-4">Existing slots will NOT be removed — new slots will be appended.</p>
                <form onSubmit={handleAddSlots} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: '2-Wheeler Slots', key: 'twoWheeler', placeholder: 'e.g. 5' },
                    { label: '4-Wheeler Slots', key: 'fourWheeler', placeholder: 'e.g. 3' },
                    { label: 'Big Vehicle Slots', key: 'bigVehicle', placeholder: 'e.g. 2' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-600">{label}</label>
                      <input
                        type="number"
                        min="0"
                        placeholder={placeholder}
                        value={addForm[key]}
                        onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-3 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={adding}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-60 text-sm"
                    >
                      {adding ? 'Adding...' : 'Confirm Add Slots'}
                    </motion.button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slot Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {filteredSlots.map((slot, index) => (
            <SlotCard
              key={slot._id}
              slot={slot}
              delay={index * 0.05}
              onUpdateStatus={handleStatusUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlotDetails;
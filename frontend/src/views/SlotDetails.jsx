import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import GlassCard from '../components/GlassCard';
import BackArrow from '../components/BackArrow';
import SlotCard from '../components/SlotCard';

const SlotDetails = () => {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('All');

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://parking-slot-allocation.onrender.com/api/slots', {
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
      await axios.put(`https://parking-slot-allocation.onrender.com/api/slots/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Slot marked as ${newStatus}`, { id: toastId });
      fetchSlots();
    } catch (error) {
      toast.error("Update failed", { id: toastId });
    }
  };

  const filteredSlots = filter === 'All' ? slots : slots.filter(s => s.type === filter);

  return (
    <div className="min-h-screen anim-gradient p-6 relative">
      <BackArrow />
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto pt-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Slot Grid</h1>

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
        </header>

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
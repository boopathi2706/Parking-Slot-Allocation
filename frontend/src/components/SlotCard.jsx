import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMoreVert, MdDirectionsCar, MdTwoWheeler, MdLocalShipping } from "react-icons/md";

const SlotCard = ({ slot, onUpdateStatus, delay }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Status-based Styles
    const statusStyles = {
        'Free': {
            border: 'border-emerald-400/30',
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
            iconBg: 'bg-emerald-50 text-emerald-500',
            badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
        },
        'Occupied': {
            border: 'border-rose-400/30',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
            iconBg: 'bg-rose-50 text-rose-500',
            badge: 'bg-rose-500/10 text-rose-600 border-rose-200'
        },
        'Repair': {
            border: 'border-amber-400/30',
            glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
            iconBg: 'bg-amber-50 text-amber-500',
            badge: 'bg-amber-500/10 text-amber-600 border-amber-200'
        },
        'Prebooked': {
            border: 'border-blue-400/30',
            glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
            iconBg: 'bg-blue-50 text-blue-500',
            badge: 'bg-blue-500/10 text-blue-600 border-blue-200'
        }
    };

    const style = statusStyles[slot.status] || statusStyles['Free'];

    const getIcon = (type) => {
        if (type === '2W') return <MdTwoWheeler />;
        if (type === '4W') return <MdDirectionsCar />;
        return <MdLocalShipping />;
    };

    return (
        <>
            {/* Click Outside Listener */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative p-5 rounded-2xl bg-white/40 backdrop-blur-md border ${style.border} ${style.glow} hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-between min-h-[160px] ${isOpen ? 'z-20' : 'z-0'}`}
            >
                {/* Top Actions */}
                <div className="absolute top-3 right-3 z-20">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-full hover:bg-white/50 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <MdMoreVert size={20} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                className="absolute right-0 top-8 w-40 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl overflow-hidden py-1 z-30"
                            >
                                {[
                                    { label: "Mark Free", status: "Free", color: "text-emerald-600" },
                                    { label: "Mark Prebooked", status: "Prebooked", color: "text-blue-600" },
                                    { label: "Mark Repair", status: "Repair", color: "text-amber-600" }
                                ].map((action) => (
                                    <button
                                        key={action.status}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onUpdateStatus(slot._id, action.status);
                                        }}
                                        className={`nav-item w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-blue-50/50 transition-colors cursor-pointer ${action.color}`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Icon & Type */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${style.iconBg} mb-3`}>
                    {getIcon(slot.type)}
                </div>

                {/* Slot Number */}
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">{slot.slotNumber}</h3>

                {/* Status Badge */}
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                    {slot.status}
                </div>
            </motion.div>
        </>
    );
};

export default SlotCard;

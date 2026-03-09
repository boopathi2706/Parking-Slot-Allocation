import React, { useState } from 'react';
import { MdClose } from "react-icons/md";
import toast from 'react-hot-toast';

const OTPModal = ({ isOpen, onClose, onSubmit, title = "Enter OTP", description = "Enter the 6-digit OTP sent to your WhatsApp number." }) => {
    const [otp, setOtp] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        onSubmit(otp);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm relative anim-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <MdClose size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined text-2xl">lock</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center text-2xl tracking-[0.5em] font-bold p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-transparent text-gray-900 dark:text-white transition-all mb-6"
                        placeholder="000000"
                        autoFocus
                    />

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                        Verify & Proceed
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTPModal;

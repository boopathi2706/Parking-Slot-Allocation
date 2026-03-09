import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { motion } from 'framer-motion';

const BackArrow = () => {
    const navigate = useNavigate();
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="absolute top-6 left-6 p-3 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-gray-700 hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-blue-500/20 transition-all z-50 cursor-pointer"
            title="Back to Dashboard"
        >
            <MdArrowBack size={24} />
        </motion.button>
    );
};

export default BackArrow;

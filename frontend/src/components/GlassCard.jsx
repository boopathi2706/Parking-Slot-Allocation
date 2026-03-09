import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
            className={twMerge(
                "bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;

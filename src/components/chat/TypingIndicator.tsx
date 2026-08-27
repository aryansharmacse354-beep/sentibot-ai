'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center space-x-2 bg-slate-900/90 border border-teal-500/30 px-4 py-3 rounded-2xl rounded-bl-none max-w-xs shadow-md"
    >
      <span className="text-xs text-teal-400 font-medium mr-1">SentiBot is typing</span>
      <div className="flex space-x-1">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
          className="w-2 h-2 bg-teal-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
          className="w-2 h-2 bg-teal-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
          className="w-2 h-2 bg-teal-400 rounded-full"
        />
      </div>
    </motion.div>
  );
};

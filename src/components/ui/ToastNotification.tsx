'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentiBot } from '@/context/SentiBotContext';
import { AlertCircle, X, Info } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toastMessage, setToastMessage } = useSentiBot();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-5 right-5 z-50 max-w-md bg-slate-900/95 border border-teal-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between space-x-3"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium leading-tight text-slate-200">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-100 transition p-1 rounded-md"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

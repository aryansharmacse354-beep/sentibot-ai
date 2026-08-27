'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentiBot } from '@/context/SentiBotContext';
import { X, Moon, Sun, Palette, SlidersHorizontal } from 'lucide-react';

interface SettingsThemeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsTheme: React.FC<SettingsThemeProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, accentColor, setAccentColor, simulateNetworkDisruption, offlineMode } = useSentiBot();

  const accentOptions = [
    { id: 'teal', name: 'Teal Accent', hex: '#0ea5e9', bg: 'bg-sky-500' },
    { id: 'blue', name: 'Royal Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
    { id: 'indigo', name: 'Indigo Aura', hex: '#6366f1', bg: 'bg-indigo-500' },
    { id: 'amber', name: 'Warm Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-teal-400 mb-2">
              <SlidersHorizontal className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-100">Portal Preferences & Theme</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Customize SentiBot AI&apos;s UI theme and simulate network disruptions.</p>

            {/* Dark / Light Toggle */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Interface Theme Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-medium transition ${
                      theme === 'dark'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-medium transition ${
                      theme === 'light'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </button>
                </div>
              </div>

              {/* Accent Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Primary Accent Palette</label>
                <div className="grid grid-cols-2 gap-2">
                  {accentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAccentColor(opt.id)}
                      className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs transition ${
                        accentColor === opt.id
                          ? 'bg-slate-800 border-teal-500/60 text-slate-100 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${opt.bg}`} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Simulation Debug Trigger */}
              <div className="pt-4 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block mb-2">Network Resilience Tester</label>
                <button
                  onClick={() => simulateNetworkDisruption()}
                  className={`w-full p-3 rounded-xl border text-xs font-medium transition flex items-center justify-center space-x-2 ${
                    offlineMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{offlineMode ? 'Disable Offline Simulation (Restore Online)' : 'Simulate Network Disruption (Offline Mode)'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

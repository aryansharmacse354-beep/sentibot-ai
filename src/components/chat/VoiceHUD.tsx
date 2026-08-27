'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentiBot } from '@/context/SentiBotContext';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Mic, MicOff, X, Volume2, Sparkles, Activity } from 'lucide-react';
import { ttsController } from '@/lib/ttsController';

interface VoiceHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({ isOpen, onClose }) => {
  const { sendMessage } = useSentiBot();
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const { isListening, transcript, error, startListening, stopListening } = useSpeechToText({
    onSpeechEnd: (spokenText) => {
      if (spokenText && !isMuted) {
        sendMessage(spokenText, true);
        onClose();
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  // Handle ESC key to close HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSpeedChange = (speed: number) => {
    setTtsSpeed(speed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg"
          role="dialog"
          aria-label="Voice Command Interface"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-slate-900/90 border border-teal-500/40 rounded-3xl p-6 shadow-2xl shadow-teal-500/10 flex flex-col items-center relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
              aria-label="Close voice interface"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex items-center space-x-2 text-teal-400 mb-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-xs font-semibold uppercase tracking-wider">Voice Activity Detection Active</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Speak to SentiBot AI</h3>
            <p className="text-xs text-slate-400 text-center mb-6">
              Web Audio VAD is listening (-50dB threshold). Speech auto-submits after 2s silence.
            </p>

            {/* SVG Audio Wave Visualizer */}
            <div className="w-full h-24 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-center px-6 overflow-hidden relative mb-6">
              <div className="flex items-center justify-center space-x-1.5 w-full">
                {[12, 28, 45, 18, 55, 75, 32, 60, 85, 40, 20, 65, 30, 50, 15].map((height, i) => (
                  <motion.div
                    key={i}
                    animate={
                      isListening
                        ? { height: [12, Math.max(16, (height * Math.random()) | 0), 12] }
                        : { height: 8 }
                    }
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                    className="w-1.5 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Live Transcript Display */}
            <div className="w-full min-h-[4rem] p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center mb-6">
              {transcript ? (
                <p className="text-sm font-medium text-teal-300 italic">"{transcript}"</p>
              ) : error ? (
                <p className="text-xs text-rose-400">{error}</p>
              ) : (
                <p className="text-xs text-slate-500 italic">Listening for input...</p>
              )}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between w-full pt-4 border-t border-slate-800 text-xs">
              {/* TTS Speed Controls */}
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 mr-1 text-[11px]">TTS Speed:</span>
                {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition ${
                      ttsSpeed === speed ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Toggle Mute / Listening */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-xl border transition ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-teal-500/40'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-400" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

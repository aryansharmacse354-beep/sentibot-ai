'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/context/SentiBotContext';
import { Volume2, VolumeX, Copy, Check, ShieldAlert, Bot, User } from 'lucide-react';
import { ttsController } from '@/lib/ttsController';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      ttsController.cancel();
      setIsPlayingAudio(false);
    } else {
      ttsController.speak(message.text);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 6000);
    }
  };

  // Color mapping for sentiment badges
  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'de-escalation':
        return { label: 'DE-ESCALATION MODE', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'anger':
        return { label: 'FRUSTRATION HIGH', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
      case 'sadness':
        return { label: 'EMPATHY ACTIVE', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' };
      case 'joy':
        return { label: 'POSITIVE MOOD', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      default:
        return { label: 'NEUTRAL ASSIST', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    }
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="my-3 flex items-center justify-center"
      >
        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-xs text-amber-300 backdrop-blur-md">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{message.text}</span>
        </div>
      </motion.div>
    );
  }

  const badge = getSentimentBadge(message.sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`my-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg transition-all ${
          isUser
            ? 'bg-slate-800/90 text-slate-100 border border-teal-500/40 rounded-br-none'
            : message.isEscalated
            ? 'bg-slate-900/95 text-slate-100 border-2 border-amber-500/60 rounded-bl-none shadow-amber-500/10'
            : 'bg-slate-900/90 text-slate-100 border border-slate-700/60 hover:border-teal-500/40 rounded-bl-none'
        }`}
      >
        {/* Header line for sender info & sentiment badge */}
        <div className="flex items-center justify-between space-x-2 mb-2 pb-1 border-b border-slate-700/40 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-300">
            {isUser ? (
              <>
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>You</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-teal-400">SentiBot AI</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isUser && message.sentiment && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${badge.bg}`}>
                {badge.label}
              </span>
            )}
            <span className="text-[10px] text-slate-400">{message.timestamp}</span>
          </div>
        </div>

        {/* Message body content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
          {message.text}
        </div>

        {/* Action icons bar */}
        <div className="mt-3 flex items-center justify-end space-x-2 pt-1 text-slate-400">
          {!isUser && (
            <button
              onClick={handleToggleAudio}
              title={isPlayingAudio ? 'Mute TTS' : 'Read aloud with Speech Synthesis'}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition"
              aria-label="Read message aloud"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-teal-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition"
            aria-label="Copy message text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

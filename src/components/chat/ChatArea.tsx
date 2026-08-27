'use client';

import React, { useEffect, useRef } from 'react';
import { useSentiBot } from '@/context/SentiBotContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const ChatArea: React.FC = () => {
  const { messages, isBotTyping, escalationState } = useSentiBot();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 relative scroll-smooth">
      {/* Active Escalation Header Alert if forced */}
      {escalationState && (
        <div className="sticky top-0 z-10 mb-4 bg-amber-900/40 border border-amber-500/50 backdrop-blur-md rounded-xl p-3 text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-semibold">Escalated to Senior Human Support Queue</span>
          </div>
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
            TICKET ACTIVE
          </span>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-teal-900/20 via-slate-900/40 to-slate-900/60 border border-teal-500/20 text-slate-300 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-slate-200 text-sm">SentiBot AI Help-Desk Console</h4>
            <p className="text-slate-400 text-[11px]">Real-time Emotion Classification & RAG Intent Pipeline Active</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VAD & Guardrails Enabled</span>
        </div>
      </div>

      {/* Render list of messages */}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Bot typing state indicator */}
      {isBotTyping && (
        <div className="my-2 flex justify-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

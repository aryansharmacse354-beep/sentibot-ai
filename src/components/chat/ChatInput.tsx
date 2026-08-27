'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useSentiBot } from '@/context/SentiBotContext';
import { Send, Mic, WifiOff, Trash2, RefreshCw } from 'lucide-react';

interface ChatInputProps {
  onOpenVoiceHUD: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onOpenVoiceHUD }) => {
  const { sendMessage, isBotTyping, offlineMode, clearHistory, simulateNetworkDisruption } = useSentiBot();
  const [text, setText] = useState<string>('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isBotTyping) return;

    const query = text;
    setText('');
    await sendMessage(query);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-md">
      {/* Offline Alert Strip if network is down */}
      {offlineMode && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>You are currently offline. Running local dictionary query engine.</span>
          </div>
          <button
            onClick={() => simulateNetworkDisruption(false)}
            className="text-[10px] underline hover:text-amber-200"
          >
            Reconnect
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          onClick={clearHistory}
          title="Clear chat history"
          className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
          aria-label="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={offlineMode ? "Type offline query..." : "Type your message or ask support..."}
            className="w-full bg-slate-950/80 text-slate-100 text-sm placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-700/80 focus:border-teal-500/70 focus:ring-1 focus:ring-teal-500/70 outline-none transition"
            aria-label="Type your message"
          />
        </div>

        <button
          type="button"
          onClick={onOpenVoiceHUD}
          title="Activate Voice Assistant (Web Speech + VAD)"
          className="p-3 rounded-xl bg-slate-800/90 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/60 transition shadow-lg shadow-teal-500/5"
          aria-label="Submit voice command"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() || isBotTyping}
          className="p-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 font-semibold transition shadow-md shadow-teal-500/20 flex items-center justify-center"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

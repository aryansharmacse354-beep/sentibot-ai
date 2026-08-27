'use client';

import React, { useState } from 'react';
import { useSentiBot } from '@/context/SentiBotContext';
import { ChatArea } from './chat/ChatArea';
import { ChatInput } from './chat/ChatInput';
import { VoiceHUD } from './chat/VoiceHUD';
import { AnalyticsPanel } from './dashboard/AnalyticsPanel';
import { ToastNotification } from './ui/ToastNotification';
import { SettingsTheme } from './SettingsTheme';
import {
  MessageSquare,
  Activity,
  Wifi,
  WifiOff,
  Settings,
  Menu,
  X,
  Bot,
  UserCheck,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { offlineMode, activeSessionId, escalationState } = useSentiBot();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVoiceHUDOpen, setIsVoiceHUDOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Mock sessions list
  const sessions = [
    { id: activeSessionId, title: 'Current Support Session', time: 'Active Now' },
    { id: 'sess-102', title: 'Billing Inquiry & Refund', time: '2 hours ago' },
    { id: 'sess-101', title: 'API Integration Help', time: 'Yesterday' },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <ToastNotification />

      {/* Voice Assistant HUD Modal */}
      <VoiceHUD isOpen={isVoiceHUDOpen} onClose={() => setIsVoiceHUDOpen(false)} />

      {/* Settings Theme Modal */}
      <SettingsTheme isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Left Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-80 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-wide">SentiBot AI</h1>
              <p className="text-[10px] text-teal-400 font-mono">EMOTION-AWARE HELPDESK</p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Connection Status Indicator */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {offlineMode ? (
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-400" />
              )}
              <div>
                <span className="text-xs font-semibold block text-slate-200">
                  {offlineMode ? 'Offline Mode (Local Engine)' : 'System Connected'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {offlineMode ? 'Dexie DB Active' : 'FastAPI REST / Gemini API'}
                </span>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                offlineMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
          </div>

          {/* Real-time Analytics Widget */}
          <div>
            <AnalyticsPanel />
          </div>

          {/* Historical Chat Sessions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Active Support Sessions
            </span>
            <div className="space-y-1.5">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                    s.id === activeSessionId
                      ? 'bg-slate-800/90 border-teal-500/50 text-slate-100 font-medium'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signature Footer (Prompt 3 requirement) */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2 text-xs text-slate-400 hover:text-teal-400 transition"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-300">Team Name: AI Experts</p>
            <p className="text-teal-400 font-medium">Team Leader: Aryan Sharma</p>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-slate-100"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>AI Help-Desk Portal</span>
                {escalationState && (
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] px-2 py-0.5 rounded-full">
                    HUMAN ESCALATION ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">Hybrid DistilRoBERTa Emotion Engine & RAG Active</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-teal-400 transition"
              title="Open preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <ChatArea />

        {/* Fixed Bottom Input Bar */}
        <ChatInput onOpenVoiceHUD={() => setIsVoiceHUDOpen(true)} />
      </main>
    </div>
  );
};

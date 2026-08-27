'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, saveMessageLocal, getLocalMessages, getPendingSyncMessages, clearLocalMessages } from '@/lib/offlineDb';
import { sendChatMessage } from '@/lib/apiClient';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  sentiment?: string;
  confidence?: number;
  voiceUrl?: string;
  isEscalated?: boolean;
}

interface SentiBotContextType {
  messages: ChatMessage[];
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  currentSentiment: string;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  activeSessionId: string;
  escalationState: boolean;
  consecutiveAngerCount: number;
  detectedLanguage: string;
  theme: 'dark' | 'light';
  accentColor: string;
  isBotTyping: boolean;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  
  sendMessage: (text: string, isVoice?: boolean) => Promise<void>;
  clearHistory: () => void;
  toggleVoiceControls: (active?: boolean) => void;
  overrideEscalation: (active: boolean) => void;
  simulateNetworkDisruption: (offline?: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAccentColor: (color: string) => void;
}

const SentiBotContext = createContext<SentiBotContextType | undefined>(undefined);

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init-1',
  text: "Hello! Welcome to SentiBot AI Help-Desk Portal. How can I assist you with your services today?",
  sender: 'bot',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  sentiment: 'neutral',
  confidence: 0.95,
};

export const SentiBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentSentiment, setCurrentSentiment] = useState<string>('neutral');
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-' + Date.now());
  const [escalationState, setEscalationState] = useState<boolean>(false);
  const [consecutiveAngerCount, setConsecutiveAngerCount] = useState<number>(0);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('EN-US');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColorState] = useState<string>('teal');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = async () => {
      setOfflineMode(false);
      setToastMessage("Connection restored! Chat synced successfully.");

      // Sync offline pending messages
      try {
        const pending = await getPendingSyncMessages();
        if (pending.length > 0) {
          for (const item of pending) {
            await sendChatMessage(item.text, messages, activeSessionId);
          }
          await db.pendingSync.clear();
        }
      } catch (err) {
        console.error("Error syncing pending messages:", err);
      }
    };

    const handleOffline = () => {
      setOfflineMode(true);
      setToastMessage("You are currently offline. Running local dictionary query engine.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setOfflineMode(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeSessionId, messages]);

  // Handle Theme switching
  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
  }, []);

  const toggleVoiceControls = useCallback((active?: boolean) => {
    setIsRecording((prev) => (active !== undefined ? active : !prev));
  }, []);

  const overrideEscalation = useCallback((active: boolean) => {
    setEscalationState(active);
    if (!active) {
      setConsecutiveAngerCount(0);
      setCurrentSentiment('neutral');
    }
  }, []);

  const simulateNetworkDisruption = useCallback((offline?: boolean) => {
    setOfflineMode((prev) => {
      const nextState = offline !== undefined ? offline : !prev;
      if (nextState) {
        setToastMessage("Network Disruption Simulated: Offline Mode Enabled.");
      } else {
        setToastMessage("Network Disruption Cleared: Online Mode Restored.");
      }
      return nextState;
    },);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([INITIAL_GREETING]);
    setEscalationState(false);
    setConsecutiveAngerCount(0);
    setCurrentSentiment('neutral');
    clearLocalMessages();
  }, []);

  // Primary Message Handler
  const sendMessage = async (text: string, isVoice: boolean = false) => {
    if (!text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      text: text.trim(),
      sender: 'user',
      timestamp: timeStr,
    };

    // Update state immediately
    setMessages((prev) => [...prev, userMsg]);
    saveMessageLocal(userMsg, activeSessionId, false);
    setIsBotTyping(true);

    try {
      // Call client API layer
      const response = await sendChatMessage(
        text,
        messages,
        activeSessionId,
        offlineMode
      );

      setIsBotTyping(false);

      // Handle sentiment & escalation check (Edge Case C: Extreme Anger)
      const emotionCategory = response.sentiment || 'neutral';
      setCurrentSentiment(emotionCategory);

      let newAngerCount = consecutiveAngerCount;
      if (emotionCategory === 'anger' && (response.confidence || 0) >= 0.75) {
        newAngerCount += 1;
      } else {
        newAngerCount = 0;
      }
      setConsecutiveAngerCount(newAngerCount);

      let isForceEscalation = escalationState;
      if (newAngerCount >= 2 && !escalationState) {
        isForceEscalation = true;
        setEscalationState(true);
        setToastMessage("We understand your frustration. SentiBot is creating an urgent support ticket now.");
      }

      const botMsgId = 'bot-' + Date.now();
      const botMsg: ChatMessage = {
        id: botMsgId,
        text: isForceEscalation
          ? "I hear how frustrating this issue is for you. I have escalated this session to our Senior Support Team. Ticket ID: #SB-" + Math.floor(100000 + Math.random() * 900000) + ". A specialist will reach out to your registered contact immediately."
          : response.reply,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: isForceEscalation ? 'de-escalation' : emotionCategory,
        confidence: response.confidence || 0.9,
        isEscalated: isForceEscalation,
      };

      setMessages((prev) => [...prev, botMsg]);
      saveMessageLocal(botMsg, activeSessionId, false);
    } catch (err: any) {
      setIsBotTyping(false);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        text: "I encountered a minor network issue processing your request. Running local fallback dictionary responder.",
        sender: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: 'neutral',
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <SentiBotContext.Provider
      value={{
        messages,
        isRecording,
        setIsRecording,
        currentSentiment,
        offlineMode,
        setOfflineMode,
        activeSessionId,
        escalationState,
        consecutiveAngerCount,
        detectedLanguage,
        theme,
        accentColor,
        isBotTyping,
        toastMessage,
        setToastMessage,
        sendMessage,
        clearHistory,
        toggleVoiceControls,
        overrideEscalation,
        simulateNetworkDisruption,
        setTheme,
        setAccentColor,
      }}
    >
      {children}
    </SentiBotContext.Provider>
  );
};

export const useSentiBot = () => {
  const context = useContext(SentiBotContext);
  if (!context) {
    throw new Error('useSentiBot must be used within a SentiBotProvider');
  }
  return context;
};

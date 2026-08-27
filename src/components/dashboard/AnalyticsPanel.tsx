'use client';

import React from 'react';
import { useSentiBot } from '@/context/SentiBotContext';
import { Smile, Frown, AlertTriangle, Globe, Shield, Activity, BarChart2 } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const { currentSentiment, detectedLanguage, consecutiveAngerCount, escalationState } = useSentiBot();

  // Calculate sentiment numerical score (0 = extreme anger, 100 = extreme joy/neutral)
  const getSentimentScore = () => {
    switch (currentSentiment?.toLowerCase()) {
      case 'joy':
        return 92;
      case 'neutral':
        return 75;
      case 'sadness':
        return 45;
      case 'anger':
        return 18;
      case 'de-escalation':
        return 10;
      default:
        return 70;
    }
  };

  const score = getSentimentScore();

  // Calculate risk level percentage
  const getRiskPercentage = () => {
    if (escalationState) return 100;
    if (consecutiveAngerCount >= 1) return 65;
    if (currentSentiment === 'sadness') return 40;
    return 15;
  };

  const riskPercentage = getRiskPercentage();

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-semibold text-slate-300">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>Real-time Analytics Panel</span>
        </div>
        <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono">
          LIVE METRICS
        </span>
      </div>

      {/* Card 1: Live Sentiment Trend Radial Score */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Live Sentiment Trend</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-bold text-slate-100">{score}%</span>
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
              [{currentSentiment}]
            </span>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={score < 30 ? 'text-rose-500' : score < 60 ? 'text-amber-400' : 'text-teal-400'}
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {score < 40 ? (
              <Frown className="w-4 h-4 text-rose-400" />
            ) : (
              <Smile className="w-4 h-4 text-teal-400" />
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Language Detected Badge */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Language & Locale</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm font-bold text-slate-100">{detectedLanguage}</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              AUTO DETECT
            </span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 text-teal-400 border border-slate-800">
          <Globe className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Escalation Risk Gauge */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Escalation Risk Gauge</span>
          <span className={`font-mono font-bold ${riskPercentage > 70 ? 'text-rose-400' : riskPercentage > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {riskPercentage}% {escalationState ? '(HUMAN QUEUE)' : ''}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              riskPercentage > 70
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : riskPercentage > 40
                ? 'bg-gradient-to-r from-teal-400 to-amber-400'
                : 'bg-gradient-to-r from-teal-500 to-emerald-400'
            }`}
            style={{ width: `${riskPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

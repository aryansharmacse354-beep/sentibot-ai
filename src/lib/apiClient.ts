import axios from 'axios';
import { ChatMessage } from '@/context/SentiBotContext';

export interface ChatApiResponse {
  reply: string;
  sentiment: string;
  confidence: number;
  intentMatched?: boolean;
  escalated?: boolean;
  source: 'fastapi' | 'gemini' | 'rag_faq' | 'offline_pattern_matcher';
}

const FAQS_MAP: Array<{ keywords: RegExp; reply: string; sentiment: string }> = [
  {
    keywords: /(pricing|cost|subscription|plan|fee|charge)/i,
    reply: "SentiBot AI offers flexible plans starting at $29/month for Starter teams, $99/month for Pro Help-Desks, and custom Enterprise tier with dedicated SLAs.",
    sentiment: "neutral",
  },
  {
    keywords: /(refund|return|money back|cancel|billing issue)/i,
    reply: "Our refund policy guarantees full reimbursement within 14 days of purchase. Please provide your transaction reference number to process your request.",
    sentiment: "neutral",
  },
  {
    keywords: /(hours|support schedule|availability|time|contact)/i,
    reply: "SentiBot AI operates 24/7 automated support. Tier-2 Human agents are available Monday to Friday, 8 AM - 8 PM EST.",
    sentiment: "neutral",
  },
  {
    keywords: /(angry|upset|terrible|horrible|broken|worst|sucks|hate)/i,
    reply: "I understand your frustration, and I sincerely apologize for the inconvenience caused. Let me immediately connect you with our senior technical escalation team.",
    sentiment: "anger",
  },
  {
    keywords: /(thank|great|awesome|helpful|love|good|perfect)/i,
    reply: "Thank you so much for your kind words! We are glad SentiBot AI could assist you effectively today.",
    sentiment: "joy",
  },
];

// Offline / Fallback Pattern Matcher Engine (Sub-5ms)
export function runLocalPatternMatcher(userText: string): ChatApiResponse {
  const normalized = userText.toLowerCase();

  for (const faq of FAQS_MAP) {
    if (faq.keywords.test(normalized)) {
      return {
        reply: faq.reply,
        sentiment: faq.sentiment,
        confidence: 0.95,
        intentMatched: true,
        source: 'offline_pattern_matcher',
      };
    }
  }

  // Generic fallback if no specific pattern matched
  return {
    reply: "I am currently processing your request via local help-desk index. For detailed support on your account or specific technical queries, please let me know your account ID.",
    sentiment: 'neutral',
    confidence: 0.7,
    source: 'offline_pattern_matcher',
  };
}

export function getApiEndpoint(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (!baseUrl) return '/api/chat';
  return `${baseUrl.replace(/\/$/, '')}/api/chat`;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  sessionId: string,
  forceOffline: boolean = false,
  locale: string = 'EN-US'
): Promise<ChatApiResponse> {
  // If explicitly offline, use local pattern matcher directly
  if (forceOffline) {
    return runLocalPatternMatcher(message);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8000ms timeout threshold
    const endpoint = getApiEndpoint();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-6).map((h) => ({ role: h.sender, content: h.text })),
        session_id: sessionId,
        locale,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error status ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || data.response || "No response received.",
      sentiment: data.sentiment || 'neutral',
      confidence: data.confidence || 0.88,
      intentMatched: data.intentMatched || false,
      escalated: data.escalated || false,
      source: data.source || 'fastapi',
    };
  } catch (err: any) {
    console.warn("API request failed or timed out (8s limit). Falling back to offline pattern matcher:", err.message);
    return runLocalPatternMatcher(message);
  }
}

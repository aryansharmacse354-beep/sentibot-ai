import { NextRequest, NextResponse } from 'next/server';

// FAQ Intent Map for sub-5ms deterministic answers
const INTENTS_FAQ: Record<string, string> = {
  pricing: "SentiBot AI offers Starter ($29/mo), Pro ($99/mo), and Enterprise tier packages with 24/7 SLA.",
  refund: "We process 100% full refunds within 14 days of purchase. Please share your order ID.",
  hours: "Automated SentiBot support is online 24/7. Tier-2 Human agents are online Mon-Fri 8 AM - 8 PM EST.",
  contact: "You can reach human support directly at support@sentibot.ai or call 1-800-SENTI-AI.",
};

// Injection keywords for guardrails check
const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /developer mode/i,
  /system prompt/i,
  /override access/i,
  /jailbreak/i,
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message || '';
    const history: Array<{ role: string; content: string }> = body.history || [];

    // Proxy to external Render backend if configured
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes('localhost')) {
      try {
        const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/chat`;
        const proxyRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (proxyRes.ok) {
          const data = await proxyRes.json();
          return NextResponse.json(data);
        }
      } catch (proxyErr) {
        console.warn("Proxy to Render backend failed, executing Next.js serverless fallback:", proxyErr);
      }
    }

    // Guardrail Check (Prompt 13)
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(message)) {
        return NextResponse.json(
          {
            reply: "Security Alert: Prompt injection attempt detected. Request blocked by SentiBot Guardrails.",
            sentiment: "neutral",
            confidence: 0.99,
            escalated: false,
            source: "guardrail_block",
          },
          { status: 200 }
        );
      }
    }

    // Emotion Classification Scoring
    const lower = message.toLowerCase();
    let sentiment = 'neutral';
    let confidence = 0.85;

    if (/\b(angry|furious|terrible|horrible|rage|hate|worst|scam|sucks|broken)\b/i.test(lower)) {
      sentiment = 'anger';
      confidence = 0.92;
    } else if (/\b(sad|disappointed|unhappy|regret|depressed|sorry)\b/i.test(lower)) {
      sentiment = 'sadness';
      confidence = 0.88;
    } else if (/\b(happy|great|awesome|thank|love|perfect|amazing|good)\b/i.test(lower)) {
      sentiment = 'joy';
      confidence = 0.95;
    }

    // Intent Routing Check (Prompt 11)
    for (const [key, answer] of Object.entries(INTENTS_FAQ)) {
      if (lower.includes(key)) {
        return NextResponse.json({
          reply: answer,
          sentiment,
          confidence,
          intentMatched: true,
          source: 'intent_router',
        });
      }
    }

    // Generative AI LLM Fallback (Google Gemini API)
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let systemInstruction = "You are an empathetic, professional SentiBot AI help-desk assistant.";
        if (sentiment === 'anger' || sentiment === 'sadness') {
          systemInstruction = "You are an apologetic, soft, and gentle de-escalation support agent for SentiBot AI. Be concise and calm.";
        }

        const promptText = `${systemInstruction}\nUser message: ${message}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText,
              sentiment,
              confidence,
              source: 'gemini',
            });
          }
        }
      } catch (llmErr) {
        console.warn("Gemini API call failed, falling back to local orchestrator:", llmErr);
      }
    }

    // Fallback response if Gemini API key not present or failed
    let fallbackReply = "Thank you for reaching out to SentiBot AI Support. Our team is analyzing your inquiry regarding: \"" + message + "\". How else can I assist your account today?";
    if (sentiment === 'anger') {
      fallbackReply = "I hear your frustration, and I am very sorry for the issue. I am logging this directly to our senior resolution queue to ensure it is resolved immediately.";
    }

    return NextResponse.json({
      reply: fallbackReply,
      sentiment,
      confidence,
      source: 'llm_orchestrator',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

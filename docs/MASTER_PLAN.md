# SentiBot AI Master Engineering & Verification Plan

## 1. System Objectives
SentiBot AI is engineered to eliminate rigid, robotic help-desk responses by continually analyzing customer emotion confidence metrics and dynamically shifting conversational tone, persona, and escalation routing.

## 2. Subsystem Map
- **Frontend Core**: `src/app`, `src/components`, `src/context/SentiBotContext.tsx`
- **Emotion Microservice**: `api/services/emotion_engine.py` (`j-hartmann/emotion-english-distilroberta-base`)
- **Guardrail Firewall**: `api/middleware/guardrails.py` & `src/app/api/chat/route.ts`
- **RAG & Vectors**: `api/routers/rag_faq.py` & `supabase/schema.sql` (`pgvector`)
- **Offline Sync & VAD**: `src/lib/offlineDb.ts` & `src/lib/vadService.ts`

## 3. Engineering Quality Criteria & Verification
- **Code Quality**: Verified via `npm run lint` and `npx tsc --noEmit`.
- **Security Posture**: Evaluated via OpenSSF Scorecard (`.github/workflows/scorecard.yml`).
- **Legal Compliance**: Enforced via DCO (`.github/workflows/dco.yml`) and REUSE specification (`REUSE.toml`).
- **Team Signature**: Team Name: **AI Experts** | Team Leader: **Aryan Sharma**.

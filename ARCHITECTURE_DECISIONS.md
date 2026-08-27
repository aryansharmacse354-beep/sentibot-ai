# Architectural Decision Records (ADRs)

> **Project**: SentiBot AI - Emotion-Aware Virtual Help-Desk  
> **Team**: AI Experts (Team Leader: Aryan Sharma)

---

## ADR 001: Decoupled Next.js 14 App Router + Python FastAPI Architecture

### Status
Accepted

### Context
Help-desk chatbots require both stateful frontend speed with instant UI rendering (Next.js 14, Tailwind CSS, Framer Motion) and specialized Python natural language processing libraries (HuggingFace Transformers, PyTorch, LangChain).

### Decision
Decouple the application into a serverless Next.js 14 App Router frontend handling state and UI, with Python FastAPI microservices handling local DistilRoBERTa emotion classification, PII sanitization guardrails, and Gemini LLM orchestration.

### Consequences
- Zero-overhead Vercel serverless deployment via `vercel.json` and `vercel-python@3.12`.
- Ultra-low latency $(< 5\text{ms})$ for local FAQ pattern matching.

---

## ADR 002: Dual-Layer Edge-Case Fallbacks (Dexie.js + Client Regex Engine)

### Status
Accepted

### Context
Network unreliability can cause support chatbots to fail during live customer chats, leading to high frustration and abandonment.

### Decision
Implement client-side IndexedDB persistence using Dexie.js (`offlineDb.ts`) paired with an 8000ms timeout interceptor (`apiClient.ts`). When offline, user queries process via a local regex pattern matcher and queue locally for auto-sync upon reconnection.

### Consequences
- Guarantee 100% uptime and accessibility regardless of client connection drops.

# AGENTS.md - AI & Developer Entry-Point Specification

> **Repository**: SentiBot AI - Emotion-Aware Virtual Help-Desk Chatbot  
> **Maintainers**: Team AI Experts (Team Leader: Aryan Sharma)  
> **Architecture**: Decoupled Next.js 14 App Router + Python FastAPI Serverless

---

## 1. System Map & Architectural Entry Points

This codebase is structured into two main tiers:

```
c:\Users\Abc\Desktop\aryan\project.html\c programing\chatbot
├── src/                      # Frontend Next.js 14 App Router
│   ├── app/                  # App Router routes & API endpoints (/api/chat)
│   ├── components/           # UI Layout, Chat Area, Voice HUD, Analytics Dashboard
│   ├── context/              # SentiBotContext.tsx state manager
│   ├── hooks/                # Custom React hooks (useSpeechToText, useSupabaseSync)
│   └── lib/                  # Offline DB (Dexie.js), VAD service, TTS controller, API Client
├── api/                      # Backend Python FastAPI microservice
│   ├── main.py               # Uvicorn ASGI entry point & routes
│   ├── services/             # HuggingFace emotion engine & Gemini LLM orchestrator
│   ├── routers/              # Intent router, RAG FAQ search, Escalation handler
│   ├── middleware/           # Anti-jailbreak guardrails & PII sanitization
│   └── utils/                # Token count sliding window manager
├── supabase/                 # Database schema, pgvector vector search & RLS policies
└── docs/                     # Architectural decision records (ADRs) & Master Plan
```

---

## 2. CI/CD Gates & Quality Enforcement

All pull requests and direct commits to `main` must pass automated CI checks defined in [.github/workflows/deploy-check.yml](file:///.github/workflows/deploy-check.yml):

- **Lint Gate**: `npm run lint` (ESLint configuration)
- **Type Safety Gate**: `npx tsc --noEmit` (TypeScript zero-error enforcement)
- **Format Convention**: Prettier auto-formatting rules
- **Security Audit**: OpenSSF Scorecard scanner ([.github/workflows/scorecard.yml](file:///.github/workflows/scorecard.yml))
- **Legal Attestation**: DCO check ([.github/workflows/dco.yml](file:///.github/workflows/dco.yml))

---

## 3. Code-Quality Conventions for AI Coding Assistants

When adding or refactoring code in this repository:
1. **Never guess API parameters or schemas**: Inspect complete symbol definitions before invoking properties.
2. **Preserve existing state hooks**: Keep transient state in React local components and persist session changes to `SentiBotContext`.
3. **Obey strict error-handling**: Wrap network calls with fallback to `offlineDb.ts` or `apiClient.ts` local pattern matcher.
4. **Accessibility First**: Assign appropriate WAI-ARIA roles (`role="log"`, `aria-live="polite"`, `aria-label`).

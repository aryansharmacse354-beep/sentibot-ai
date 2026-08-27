# SentiBot AI IDE System Rules & Coding Guidelines

- **Framework**: Next.js 14 App Router (TypeScript, React 18/19, Tailwind CSS).
- **Backend**: FastAPI (Python 3.12).
- **Styling**: Tailwind CSS with custom glassmorphism utilities (`glass-panel`, `glass-card`).
- **State Management**: `SentiBotContext` for global session, emotion, and escalation flags.
- **Emotion Pipeline**: `j-hartmann/emotion-english-distilroberta-base` HuggingFace pipeline.
- **Offline Storage**: Dexie.js (`offlineDb.ts`) with fallback pattern matcher (`apiClient.ts`).
- **Guardrails**: Always sanitize inputs via `guardrails.py` / `route.ts` before LLM processing.
- **WAI-ARIA Compliance**: Ensure all interactive controls have accessible labels and keyboard bindings (`Enter`, `Escape`).

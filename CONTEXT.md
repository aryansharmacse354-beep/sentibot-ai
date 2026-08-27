# CONTEXT.md - Domain Glossary & Canonical Terminology

This document establishes the canonical domain terminology used across SentiBot AI. All developers, documentation, and AI coding models must use these exact terms when naming variables, defining schemas, or submitting pull requests.

---

## 📚 Canonical Terms

### 1. Hybrid NLP (`HybridNLP`)
The two-stage Natural Language Processing pipeline combining local pre-trained HuggingFace emotion classifiers (`j-hartmann/emotion-english-distilroberta-base`) with generative LLMs (Google Gemini API) to condition system prompts with real-time emotional metadata.

### 2. Emotion Confidence (`EmotionConfidence`)
The floating-point probability score (range `[0.00, 1.00]`) returned by the DistilRoBERTa model indicating confidence in the assigned emotion category (*Anger, Disgust, Fear, Joy, Neutral, Sadness, Surprise*).

### 3. De-Escalation Threshold (`DeEscalationThreshold`)
The quantitative rule metric defined as `Anger >= 0.75` across two consecutive user messages. Reaching this threshold bypasses generative LLM loops and forces immediate human-agent ticket creation and layout transition.

### 4. Voice Activity Detection (`VAD`)
The client-side Web Audio API AnalyserNode algorithm sampling microphone audio frequencies. If peak audio power drops below `-50dB` for more than `2.0` consecutive seconds, VAD programmatically triggers speech recording termination and auto-submits input.

### 5. Retrieval-Augmented Generation (`RAG`)
The vector similarity search mechanism querying Supabase `pgvector` FAQ embeddings (`vector(1536)`). Results with cosine similarity $> 0.82$ bypass generative token expenditure and dispatch deterministic answers in $< 50\text{ms}$.

### 6. PII Masking & Anti-Jailbreak Guardrails (`Guardrails`)
The FastAPI regex sanitizer checking incoming prompts for injection keywords (`ignore previous instructions`, `developer mode`) and masking credit card or Social Security numbers (`[CARD MASKED]`).

### 7. Dexie Offline Sync (`OfflineSync`)
The client-side IndexedDB database fallback using Dexie.js. When `navigator.onLine` is false or network timeout exceeds `8000ms`, user messages queue locally to `pendingSync` and process via a regex pattern matcher.

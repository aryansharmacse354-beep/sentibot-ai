# SentiBot AI - Emotion-Aware Virtual Help-Desk Chatbot

![SentiBot AI Banner](https://img.shields.io/badge/SentiBot_AI-v1.0.0-0ea5e9?style=for-the-badge&logo=probot)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.12-009688?style=for-the-badge&logo=fastapi)
![HuggingFace](https://img.shields.io/badge/HuggingFace-DistilRoBERTa-FFD21E?style=for-the-badge&logo=huggingface)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3FCF8E?style=for-the-badge&logo=supabase)

**SentiBot AI** is an advanced, production-ready, emotion-aware virtual help-desk chatbot designed to transform business customer service. Instead of offering rigid, robotic interactions, SentiBot AI continuously evaluates customer sentiment and intent using a hybrid natural language processing pipeline before passing structured context to Generative AI engines (Google Gemini API).

---

## 🌟 Team Information

- **Team Name**: AI Experts
- **Team Leader**: Aryan Sharma
- **GitHub Repository**: [aryansharmacse354-beep/sentibot-ai](https://github.com/aryansharmacse354-beep/sentibot-ai)

---

## 🔥 Key Features

- **Hybrid NLP Emotion Classifier**: Pre-trained HuggingFace `j-hartmann/emotion-english-distilroberta-base` model running on FastAPI to classify emotions (Anger, Disgust, Fear, Joy, Neutral, Sadness, Surprise).
- **Dynamic De-Escalation Persona**: Automatically adapts tone to soft, empathetic de-escalation when sadness or anger is detected.
- **Automated Escalation Queue**: Triggers human support ticket creation and mock email alerts when Anger $\ge 0.75$ across 2 consecutive messages.
- **Offline IndexedDB Resilience**: Uses Dexie.js on the client to queue messages during network disruptions, falling back to a client-side pattern matcher.
- **Voice Activity Detection (VAD)**: Browser Web Audio API AnalyserNode (-50dB threshold) auto-stops mic recording after 2s of silence.
- **Deterministic RAG & Intent Router**: Sub-5ms FAQ pattern matcher and Supabase `pgvector` similarity lookup (> 0.82).

---

## 🏗️ Architecture

```
   ┌─────────────────────────────────────────────────────────┐
   │                  Next.js 14 App Router                  │
   │      (React 18 / TypeScript / Tailwind / Framer)        │
   └────────────────────────────┬────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌─────────────────────────┐           ┌───────────────────────────┐
│     Dexie.js Client     │           │     FastAPI Python API    │
│  (IndexedDB / Offline)  │           │   (Emotion & Guardrails)  │
└─────────────────────────┘           └─────────────┬─────────────┘
                                                    │
                                ┌───────────────────┴───────────────────┐
                                ▼                                       ▼
                     ┌─────────────────────┐                 ┌─────────────────────┐
                     │ DistilRoBERTa Model │                 │   Gemini LLM / RAG  │
                     │  (Emotion Scoring)  │                 │  (Supabase Vector)  │
                     └─────────────────────┘                 └─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.12 (optional for local FastAPI service)

### Installation
```bash
# Clone the repository
git clone https://github.com/aryansharmacse354-beep/sentibot-ai.git
cd sentibot-ai

# Install dependencies
npm install

# Run frontend development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the live dashboard!

---

## 📜 License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/Abc/Desktop/aryan/project.html/c%20programing/chatbot/LICENSE) and [REUSE.toml](file:///c:/Users/Abc/Desktop/aryan/project.html/c%20programing/chatbot/REUSE.toml) for details.

import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional

from api.middleware.guardrails import sanitize_and_check_guardrails
from api.services.emotion_engine import analyze_sentiment
from api.routers.intent_router import match_faq_intent
from api.services.llm_orchestrator import generate_llm_response
from api.routers.rag_faq import query_rag_vector_faq
from api.routers.escalation import process_escalation_trigger

import os

# Configure structured JSON logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("sentibot.api")

app = FastAPI(
    title="SentiBot AI Backend API",
    description="Emotion-Aware Help-Desk NLP Microservice & Router",
    version="1.0.0"
)

# Parse CORS Origins from Environment
env_origins = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://chatbot-sable-six-21.vercel.app",
    "https://chatbot-n0mr885fc-ai-experts1.vercel.app",
    "https://sentibot-ai.vercel.app"
]
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class ChatMessagePayload(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessagePayload]] = []
    session_id: Optional[str] = "session-default"
    locale: Optional[str] = "EN-US"

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "SentiBot AI FastAPI Backend",
        "team": "AI Experts",
        "team_leader": "Aryan Sharma"
    }

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    message = payload.message
    session_id = payload.session_id or "session-default"

    # 1. Anti-Jailbreak & Sanitization Guardrails
    is_safe, sanitized_text, error_msg = sanitize_and_check_guardrails(message)
    if not is_safe:
        return {
            "reply": f"Security Alert: {error_msg}",
            "sentiment": "neutral",
            "confidence": 0.99,
            "escalated": False,
            "source": "guardrail_block"
        }

    # 2. Emotion Analysis Classification
    emotion_res = analyze_sentiment(sanitized_text)
    sentiment_label = emotion_res["label"]
    confidence = emotion_res["confidence"]

    # Check for extreme anger escalation trigger
    if sentiment_label == "anger" and confidence >= 0.75:
        process_escalation_trigger(session_id, confidence, sanitized_text)

    # 3. Deterministic FAQ Intent Router (Sub-5ms)
    faq_match = match_faq_intent(sanitized_text)
    if faq_match:
        return {
            "reply": faq_match,
            "sentiment": sentiment_label,
            "confidence": confidence,
            "intentMatched": True,
            "source": "intent_router"
        }

    # 4. RAG Vector FAQ Search (Supabase pgvector)
    rag_match = query_rag_vector_faq(sanitized_text)
    if rag_match:
        return {
            "reply": rag_match,
            "sentiment": sentiment_label,
            "confidence": confidence,
            "intentMatched": True,
            "source": "rag_faq"
        }

    # 5. Generative LLM Fallback (Gemini API Orchestrator)
    history_list = [{"role": m.role, "content": m.content} for m in payload.history] if payload.history else []
    reply = generate_llm_response(sanitized_text, history_list, sentiment_label)

    return {
        "reply": reply,
        "sentiment": sentiment_label,
        "confidence": confidence,
        "intentMatched": False,
        "source": "llm_orchestrator"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled FastAPI Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Processing Issue", "details": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=False)

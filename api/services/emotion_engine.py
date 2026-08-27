import logging
from typing import Dict, Any

logger = logging.getLogger("sentibot.emotion")

_pipeline = None

def get_emotion_pipeline():
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline
            import torch
            device = 0 if torch.cuda.is_available() else -1
            logger.info(f"Loading emotion classification pipeline on device: {'GPU' if device == 0 else 'CPU'}")
            _pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True,
                device=device
            )
        except Exception as e:
            logger.warning(f"Could not load HuggingFace pipeline ({e}). Falling back to rule-based classifier.")
            _pipeline = "fallback"
    return _pipeline

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyzes sentiment of input text.
    Returns dict: {"label": str, "confidence": float, "scores": dict}
    """
    pipe = get_emotion_pipeline()

    if pipe != "fallback" and pipe is not None:
        try:
            results = pipe(text)[0]
            # Find max score
            best = max(results, key=lambda x: x['score'])
            scores_dict = {item['label']: round(item['score'], 4) for item in results}
            return {
                "label": best['label'],
                "confidence": round(best['score'], 4),
                "scores": scores_dict
            }
        except Exception as err:
            logger.error(f"Error during HuggingFace inference: {err}")

    # Heuristic fallback if ML model is unavailable
    lower = text.lower()
    if any(w in lower for w in ['angry', 'terrible', 'horrible', 'hate', 'scam', 'rage', 'broken', 'sucks']):
        return {"label": "anger", "confidence": 0.90, "scores": {"anger": 0.90, "neutral": 0.10}}
    elif any(w in lower for w in ['sad', 'disappointed', 'sorry', 'depressed', 'regret']):
        return {"label": "sadness", "confidence": 0.85, "scores": {"sadness": 0.85, "neutral": 0.15}}
    elif any(w in lower for w in ['happy', 'great', 'awesome', 'thanks', 'thank', 'love', 'good']):
        return {"label": "joy", "confidence": 0.92, "scores": {"joy": 0.92, "neutral": 0.08}}

    return {"label": "neutral", "confidence": 0.80, "scores": {"neutral": 0.80}}

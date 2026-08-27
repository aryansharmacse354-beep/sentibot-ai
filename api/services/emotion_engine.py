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
            logger.info(f"Loading local PyTorch emotion pipeline on device: {'GPU' if device == 0 else 'CPU'}")
            _pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True,
                device=device
            )
        except Exception as e:
            logger.warning(f"Could not load local HuggingFace PyTorch pipeline ({e}). Using rule-based fallback.")
            _pipeline = "fallback"
    return _pipeline

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyzes sentiment of input text using local PyTorch HuggingFace DistilRoBERTa model.
    """
    pipe = get_emotion_pipeline()

    if pipe != "fallback" and pipe is not None:
        try:
            results = pipe(text)[0]
            best = max(results, key=lambda x: x['score'])
            scores_dict = {item['label']: round(item['score'], 4) for item in results}
            return {
                "label": best['label'],
                "confidence": round(best['score'], 4),
                "scores": scores_dict
            }
        except Exception as err:
            logger.error(f"Error during PyTorch HuggingFace inference: {err}")

    # Fallback heuristic classifier
    lower = text.lower()
    if any(w in lower for w in ['angry', 'terrible', 'horrible', 'hate', 'scam', 'rage', 'broken', 'sucks', 'furious']):
        return {"label": "anger", "confidence": 0.92, "scores": {"anger": 0.92, "neutral": 0.08}}
    elif any(w in lower for w in ['sad', 'disappointed', 'sorry', 'depressed', 'regret', 'unhappy']):
        return {"label": "sadness", "confidence": 0.88, "scores": {"sadness": 0.88, "neutral": 0.12}}
    elif any(w in lower for w in ['happy', 'great', 'awesome', 'thanks', 'thank', 'love', 'good', 'perfect']):
        return {"label": "joy", "confidence": 0.95, "scores": {"joy": 0.95, "neutral": 0.05}}

    return {"label": "neutral", "confidence": 0.85, "scores": {"neutral": 0.85}}

from fastapi import APIRouter
from typing import Optional, Dict

router = APIRouter()

FAQ_DICTIONARY: Dict[str, str] = {
    "pricing": "SentiBot AI offers Starter ($29/mo), Pro ($99/mo), and Enterprise tier packages with 24/7 SLA.",
    "refund": "We process 100% full refunds within 14 days of purchase. Please share your order ID.",
    "hours": "Automated SentiBot support is online 24/7. Tier-2 Human agents are online Mon-Fri 8 AM - 8 PM EST.",
    "contact": "You can reach human support directly at support@sentibot.ai or call 1-800-SENTI-AI.",
}

def match_faq_intent(text: str) -> Optional[str]:
    """Matches text against deterministic FAQ dictionary."""
    lower = text.lower()
    for keyword, answer in FAQ_DICTIONARY.items():
        if keyword in lower:
            return answer
    return None

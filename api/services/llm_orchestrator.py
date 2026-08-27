import os
import logging
from typing import List, Dict, Any
from api.utils.token_helper import apply_sliding_window

logger = logging.getLogger("sentibot.llm")

def generate_llm_response(message: str, history: List[Dict[str, str]], emotion: str) -> str:
    """
    Orchestrates LLM output with dynamic system persona based on detected emotion.
    """
    # 1. Truncate context window to max 3000 tokens
    bounded_history = apply_sliding_window(history, max_tokens=3000)

    # 2. Build empathetic system persona prompt
    if emotion in ['anger', 'sadness', 'de-escalation']:
        persona = "You are an extremely gentle, apologetic, soft-spoken SentiBot AI de-escalation specialist. Validate the customer's frustration immediately and keep responses brief."
    elif emotion == 'joy':
        persona = "You are an enthusiastic, warm, and helpful SentiBot AI help-desk assistant."
    else:
        persona = "You are a professional, efficient, and clear SentiBot AI help-desk assistant."

    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"{persona}\nCustomer message: {message}"
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as err:
            logger.error(f"Gemini SDK invocation error: {err}")

    # Deterministic fallback response if API key is not configured or fails
    if emotion == 'anger':
        return "I hear your frustration, and I apologize for the trouble. I am creating a senior escalation ticket right away to ensure your issue is fixed."
    return f"Thank you for contacting SentiBot AI Support regarding: '{message}'. How else can I assist your account today?"

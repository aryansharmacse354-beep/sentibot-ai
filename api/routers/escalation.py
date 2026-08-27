import os
import logging
from typing import Dict, Any

logger = logging.getLogger("sentibot.escalation")

def process_escalation_trigger(session_id: str, anger_level: float, last_message: str) -> Dict[str, Any]:
    """
    Creates human ticket in Supabase and triggers email payload.
    """
    ticket_id = f"SB-{session_id[-6:]}"
    mock_email_payload = {
        "to": "tier2-support@sentibot.ai",
        "subject": f"URGENT ESCALATION: Ticket {ticket_id}",
        "session_id": session_id,
        "anger_score": anger_level,
        "last_message": last_message,
        "action": "Immediate Human Agent Call Back Required",
    }

    logger.warning(f"MOCK EMAIL DISPATCHED: {mock_email_payload}")

    # Log to Supabase if configured
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if supabase_url and supabase_key:
        try:
            from supabase import create_client
            client = create_client(supabase_url, supabase_key)
            client.table("escalations").insert({
                "session_id": session_id,
                "customer_anger_level": anger_level,
                "reason": last_message,
                "status": "OPEN",
            }).execute()
        except Exception as err:
            logger.error(f"Supabase escalation record failed: {err}")

    return {
        "escalated": True,
        "ticket_id": ticket_id,
        "notice": "Human escalation queue triggered successfully.",
    }

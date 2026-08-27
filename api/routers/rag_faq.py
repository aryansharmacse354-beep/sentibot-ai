import os
import logging
from typing import Optional

logger = logging.getLogger("sentibot.rag")

def query_rag_vector_faq(query_text: str) -> Optional[str]:
    """
    Queries Supabase pgvector FAQ table for semantic similarity > 0.82.
    """
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        return None

    try:
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        
        # Execute RPC call match_faqs on Supabase pgvector
        response = supabase.rpc(
            "match_faqs",
            {"query_text": query_text, "match_threshold": 0.82, "match_count": 1}
        ).execute()

        if response.data and len(response.data) > 0:
            return response.data[0].get("answer")
    except Exception as err:
        logger.warning(f"RAG Vector search error: {err}")

    return None

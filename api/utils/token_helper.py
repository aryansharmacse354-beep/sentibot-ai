from typing import List, Dict

def estimate_tokens(text: str) -> int:
    """Rough estimation of token count (~4 chars per token)."""
    return len(text) // 4 + 1

def apply_sliding_window(history: List[Dict[str, str]], max_tokens: int = 3000) -> List[Dict[str, str]]:
    """
    Applies sliding window context management to limit memory history to max_tokens.
    Always preserves the most recent 3 conversational exchanges.
    """
    if not history:
        return []

    # Preserve recent exchanges
    recent_exchanges = history[-6:]
    total_tokens = sum(estimate_tokens(msg.get('content', '')) for msg in recent_exchanges)

    if total_tokens <= max_tokens:
        return recent_exchanges

    # Truncate oldest messages if exceeding budget
    selected = []
    current_tokens = 0
    for msg in reversed(recent_exchanges):
        msg_tokens = estimate_tokens(msg.get('content', ''))
        if current_tokens + msg_tokens > max_tokens:
            break
        selected.append(msg)
        current_tokens += msg_tokens

    return list(reversed(selected))

import re
from typing import Tuple

INJECTION_PATTERNS = [
    r'ignore\s+(all\s+)?previous\s+instructions',
    r'developer\s+mode',
    r'system\s+prompt',
    r'override\s+access',
    r'jailbreak',
]

# Credit card regex matcher
CREDIT_CARD_REGEX = r'\b(?:\d[ -]*?){13,16}\b'
SSN_REGEX = r'\b\d{3}-\d{2}-\d{4}\b'

def sanitize_and_check_guardrails(text: str) -> Tuple[bool, str, str]:
    """
    Evaluates input text for jailbreaks or PII leaks.
    Returns (is_safe, sanitized_text, error_reason)
    """
    # 1. Check prompt injection
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return False, text, "Prompt injection attempt detected."

    # 2. Mask PII leaks
    sanitized = re.sub(CREDIT_CARD_REGEX, '[CARD MASKED]', text)
    sanitized = re.sub(SSN_REGEX, '[SSN MASKED]', sanitized)

    return True, sanitized, ""

"""JWT helpers for account models."""

from __future__ import annotations

import base64
import json
from typing import Any, Dict, Optional


def decode_jwt(token: Optional[str]) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    try:
        parts = token.split(".")
        if len(parts) < 2:
            return None
        payload = parts[1]
        payload += "=" * ((4 - len(payload) % 4) % 4)
        return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))
    except Exception:
        return None

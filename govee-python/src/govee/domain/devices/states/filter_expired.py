"""Filter expired state parsing.

Minimal port: parse payload.state.filterExpired boolean value.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def parse_filter_expired(payload: Optional[Dict[str, Any]]) -> Optional[bool]:
    if payload is None:
        return None
    st = payload.get("state") if isinstance(payload, dict) else None
    if not isinstance(st, dict):
        return None
    val = st.get("filterExpired")
    if isinstance(val, bool):
        return val
    return None


__all__ = ["parse_filter_expired"]

"""Power state parsing helpers."""
from __future__ import annotations

from typing import Optional


def parse_power(payload: dict) -> Optional[bool]:
    """Parse power information from a device payload.

    Accepts common keys: 'power', 'on', numeric 0/1 and boolean values.
    Returns True/False when present or None when not specified.
    """
    if payload is None:
        return None
    if "power" in payload:
        v = payload.get("power")
    elif "on" in payload:
        v = payload.get("on")
    else:
        return None

    # normalize numeric representations
    if isinstance(v, (int, float)):
        return bool(int(v))
    if isinstance(v, str):
        if v.isdigit():
            return bool(int(v))
        lower = v.strip().lower()
        if lower in ("true", "on", "1"):
            return True
        if lower in ("false", "off", "0"):
            return False
    if isinstance(v, bool):
        return v
    return None


__all__ = ["parse_power"]


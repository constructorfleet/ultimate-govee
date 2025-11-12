"""Brightness parsing helpers for device payloads."""

from __future__ import annotations

from typing import Optional


def parse_brightness(payload: dict) -> Optional[int]:
    """Parse brightness from payload.

    Accepts numeric values, numeric strings, or keys like 'bright'.
    Normalizes to an int if present, otherwise returns None. Clamps to
    the 0-100 range when possible.
    """
    if payload is None:
        return None
    val = None
    if "brightness" in payload:
        val = payload.get("brightness")
    elif "bright" in payload:
        val = payload.get("bright")

    if val is None:
        return None

    try:
        if isinstance(val, str):
            v = int(float(val))
        else:
            v = int(val)
    except Exception:
        return None

    # clamp
    if v < 0:
        v = 0
    if v > 100:
        v = 100
    return v


__all__ = ["parse_brightness"]

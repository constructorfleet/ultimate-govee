"""Color parsing helpers: normalize different color representations.

Supported inputs:
- dict with 'r','g','b' -> passed through (values coerced to ints)
- hex string like '#RRGGBB' or 'RRGGBB' -> parsed into r/g/b
- integer or numeric string interpreted as hex integer -> parsed into r/g/b
"""

from __future__ import annotations

from typing import Dict, Optional


def _parse_hex_string(s: str) -> Optional[Dict[str, int]]:
    s = s.strip()
    if s.startswith("#"):
        s = s[1:]
    if len(s) != 6:
        return None
    try:
        r = int(s[0:2], 16)
        g = int(s[2:4], 16)
        b = int(s[4:6], 16)
        return {"r": r, "g": g, "b": b}
    except Exception:
        return None


def parse_color(payload: dict) -> Optional[Dict[str, int]]:
    if payload is None:
        return None
    # explicit rgb dict
    if "rgb" in payload and isinstance(payload.get("rgb"), dict):
        try:
            r = int(payload["rgb"].get("r"))
            g = int(payload["rgb"].get("g"))
            b = int(payload["rgb"].get("b"))
            return {"r": r, "g": g, "b": b}
        except Exception:
            return None

    # direct color key may be hex or dict
    c = payload.get("color")
    if isinstance(c, dict):
        try:
            return {"r": int(c.get("r")), "g": int(c.get("g")), "b": int(c.get("b"))}
        except Exception:
            return None
    if isinstance(c, str):
        return _parse_hex_string(c)

    # numeric hex value
    if "color" in payload and isinstance(payload.get("color"), (int,)):
        v = payload.get("color")
        try:
            r = (v >> 16) & 0xFF
            g = (v >> 8) & 0xFF
            b = v & 0xFF
            return {"r": r, "g": g, "b": b}
        except Exception:
            return None

    return None


__all__ = ["parse_color"]

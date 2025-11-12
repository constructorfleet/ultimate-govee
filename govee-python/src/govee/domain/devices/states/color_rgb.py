"""Color RGB parsing helpers and minimal state for devices."""
from __future__ import annotations

from typing import Any, Dict, Optional


def parse_color_rgb(payload: Dict[str, Any]) -> Optional[Dict[str, int]]:
    """Parse an RGB color from a payload.

    Accepts a dict {'r':R,'g':G,'b':B} or a hex string like '#RRGGBB' or 'RRGGBB'.
    Returns a dict with integer r,g,b keys or None if not present/parsable.
    """
    if not payload:
        return None
    # direct dict
    c = payload.get('color') or payload.get('rgb')
    if isinstance(c, dict):
        try:
            return { 'r': int(c.get('r',0)), 'g': int(c.get('g',0)), 'b': int(c.get('b',0)) }
        except Exception:
            return None
    # try hex string in payload keys
    for key in ('colorHex','color_hex','colorHexString','hex'):
        h = payload.get(key)
        if isinstance(h, str):
            s = h.strip().lstrip('#')
            if len(s) == 6:
                try:
                    r = int(s[0:2],16)
                    g = int(s[2:4],16)
                    b = int(s[4:6],16)
                    return {'r': r, 'g': g, 'b': b}
                except Exception:
                    return None
    return None


class ColorRGBState:
    def __init__(self, device: Any):
        self.device = device
        self.color: Optional[Dict[str,int]] = None

    def parse(self, payload: Dict[str,Any]) -> None:
        self.color = parse_color_rgb(payload)

    def get(self) -> Optional[Dict[str,int]]:
        return self.color


__all__ = ['parse_color_rgb','ColorRGBState']


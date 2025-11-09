"""Battery level parsing state.

Minimal port of lib/domain/devices/states/battery-level.state.ts: extract
battery as integer 0-100 from top-level or state.battery.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


def parse_battery(payload: Optional[Dict[str, Any]]) -> Optional[int]:
    if payload is None:
        return None
    # prefer direct battery key
    battery = None
    if isinstance(payload, dict):
        battery = payload.get('battery')
        if battery is None:
            st = payload.get('state')
            if isinstance(st, dict):
                battery = st.get('battery')
    try:
        if battery is None:
            return None
        b = int(battery)
    except Exception:
        return None
    if b < 0 or b > 100:
        return None
    return b


__all__ = ['parse_battery']

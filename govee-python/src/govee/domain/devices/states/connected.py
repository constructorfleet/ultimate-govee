"""Connected state for devices.

Port of lib/domain/devices/states/connected.state.ts -> Python.

This state inspects incoming device status payloads and extracts common
connected/online boolean keys: state.isConnected, state.isOnline,
state.connected, state.online.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def parse_connected(payload: Optional[Dict[str, Any]]) -> Optional[bool]:
    if payload is None:
        return None
    st = payload.get("state") if isinstance(payload, dict) else None
    if isinstance(st, dict):
        if isinstance(st.get("isConnected"), bool):
            return st.get("isConnected")
        if isinstance(st.get("isOnline"), bool):
            return st.get("isOnline")
        if isinstance(st.get("connected"), bool):
            return st.get("connected")
        if isinstance(st.get("online"), bool):
            return st.get("online")
    return None


__all__ = ["parse_connected"]

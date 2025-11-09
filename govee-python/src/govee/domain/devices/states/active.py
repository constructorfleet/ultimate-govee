"""Active state parsing.

Minimal port of lib/domain/devices/states/active.state.ts focusing on
parsing boolean active/on state from payloads and simple op arrays.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


def parse_active(payload: Optional[Dict[str, Any]]) -> Optional[bool]:
    if payload is None:
        return None
    st = payload.get("state") if isinstance(payload, dict) else None
    if isinstance(st, dict) and isinstance(st.get("isOn"), bool):
        return st.get("isOn")
    # op code parsing: accept op.command arrays with first byte 0x00 or 0x01
    op = payload.get("op") if isinstance(payload, dict) else None
    if isinstance(op, dict):
        cmds = op.get("command")
        if isinstance(cmds, list) and cmds:
            cmd = cmds[0]
            if isinstance(cmd, list) and len(cmd) >= 1:
                val = cmd[0]
                if val in (0x00, 0x01):
                    return val == 0x01
    return None


__all__ = ["parse_active"]

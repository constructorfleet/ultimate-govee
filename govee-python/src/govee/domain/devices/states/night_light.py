"""Night light state parsing helpers.

Minimal port: parse op.command [on_flag, brightness] and produce a
state_to_command helper.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


def parse_night_light(payload: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if payload is None:
        return None
    op = payload.get('op') if isinstance(payload, dict) else None
    if isinstance(op, dict):
        cmds = op.get('command')
        if isinstance(cmds, list) and cmds:
            cmd = cmds[0] if isinstance(cmds[0], list) else cmds
            if isinstance(cmd, list) and len(cmd) >= 2:
                on = cmd[0] == 0x01
                try:
                    brightness = int(cmd[1])
                except Exception:
                    brightness = None
                return {'on': on, 'brightness': brightness}
    st = payload.get('state') if isinstance(payload, dict) else None
    if isinstance(st, dict):
        on = st.get('on')
        brightness = st.get('brightness')
        if isinstance(on, bool) and isinstance(brightness, int):
            return {'on': on, 'brightness': brightness}
    return None


def state_to_command_nightlight(identifier: list[int], state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    on = state.get('on')
    brightness = state.get('brightness')
    if not isinstance(on, bool) or not isinstance(brightness, int):
        return None
    return {
        'status': {'op': {'command': [[1 if on else 0, brightness]]}},
        'command': {'data': {'command': [[2] + identifier + ([1 if on else 0, brightness])]}}
    }

__all__ = ['parse_night_light', 'state_to_command_nightlight']

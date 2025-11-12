"""Control lock state parsing.

Minimal port: parse op command first byte (0x01 -> locked True) and provide
stateToCommand-like helper to form op.command and status when needed.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def parse_control_lock(payload: Optional[Dict[str, Any]]) -> Optional[bool]:
    if payload is None:
        return None
    # check op.command first
    op = payload.get("op") if isinstance(payload, dict) else None
    if isinstance(op, dict):
        cmds = op.get("command")
        if isinstance(cmds, list) and cmds:
            cmd = cmds[0] if isinstance(cmds[0], list) else cmds
            if isinstance(cmd, list) and len(cmd) >= 1:
                return cmd[0] == 0x01
    # check state.lock boolean
    st = payload.get("state") if isinstance(payload, dict) else None
    if isinstance(st, dict) and isinstance(st.get("controlLock"), bool):
        return st.get("controlLock")
    return None


def state_to_command_control_lock(
    identifier: list[int], next_state: bool
) -> Dict[str, Any]:
    # return structure similar to TypeScript stateToCommand: command list and status
    return {
        "command": [
            {"data": {"command": [[2] + identifier + ([1] if next_state else [0])]}}
        ],
        "status": {"op": {"command": [[1 if next_state else 0]]}},
    }


__all__ = ["parse_control_lock", "state_to_command_control_lock"]

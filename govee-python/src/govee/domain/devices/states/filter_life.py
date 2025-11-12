"""Filter life parsing from op-command arrays.

Minimal port: extract byte at index 5 of op.command list and validate 0-100.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def parse_filter_life(payload: Optional[Dict[str, Any]]) -> Optional[int]:
    if payload is None:
        return None
    op = payload.get("op") if isinstance(payload, dict) else None
    if not isinstance(op, dict):
        return None
    cmds = op.get("command")
    if not isinstance(cmds, list) or not cmds:
        return None
    cmd = cmds[0] if isinstance(cmds[0], list) else cmds
    if not isinstance(cmd, list) or len(cmd) <= 5:
        return None
    val = cmd[5]
    try:
        v = int(val)
    except Exception:
        return None
    if v < 0 or v > 100:
        return None
    return v


__all__ = ["parse_filter_life"]

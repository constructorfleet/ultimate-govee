"""Unknown state parser: capture raw op command codes for untyped identifiers.

This port implements a minimal UnknownState parser that accepts op.command
arrays and produces a dict with 'codes' set to the received bytes.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


def parse_unknown(payload: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if payload is None:
        return None
    op = payload.get("op") if isinstance(payload, dict) else None
    if not isinstance(op, dict):
        return None
    cmds = op.get("command")
    if not isinstance(cmds, list) or not cmds:
        return None
    cmd = cmds[0]
    if not isinstance(cmd, list):
        return None
    # return the raw codes as-is
    return {"codes": cmd}


__all__ = ["parse_unknown"]

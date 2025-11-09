"""Light effect parsing: maintain list of effects and active effect code.

This is a minimal port of the TypeScript LightEffectState behavior used by
unit tests: track effects in a simple dict and update the active effect
when an op command with matching identifier is received.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


class EffectStore:
    def __init__(self):
        self._store: Dict[int, Dict[str, Any]] = {}

    def set(self, key: int, value: Dict[str, Any]) -> None:
        self._store[key] = value

    def get(self, key: int) -> Optional[Dict[str, Any]]:
        return self._store.get(key)


def parse_light_effect_op(op_payload: Dict[str, Any], identifier: list[int], effects: EffectStore) -> Optional[Dict[str, Any]]:
    # expect op_payload like { 'command': [[opType, id1, id2, value_high, value_low]] }
    if not isinstance(op_payload, dict):
        return None
    cmds = op_payload.get('command')
    if not isinstance(cmds, list) or not cmds:
        return None
    # support either a list-of-commands ([[...], ...]) or a single flattened
    # command ([...]) passed in tests
    if isinstance(cmds[0], list):
        cmd = cmds[0]
    else:
        # cmds itself is the command list
        cmd = cmds
    if not isinstance(cmd, list) or len(cmd) < (len(identifier) + 2 + 1):
        return None
    # compute effect code from next two bytes after identifiers
    # op command layout: [opType, id1, id2, value_hi, value_lo]
    op_type = cmd[0]
    # verify identifiers match
    ids = cmd[1:1+len(identifier)]
    if ids != identifier:
        return None
    hi = cmd[1+len(identifier)]
    lo = cmd[2+len(identifier)]
    effect_code = (hi << 8) + lo
    return effects.get(effect_code)


__all__ = ["EffectStore", "parse_light_effect_op"]

"""Effect state that provides encode/parse for effect commands.

Wraps parse_effect helper and exposes encode so RGBICDevice can delegate
effect encoding instead of special-casing it.
"""
from __future__ import annotations

from typing import Any, Dict, Optional, List

from .effect import parse_effect


class EffectState:
    def __init__(self, device: Any):
        self.device = device
        self.effect: Optional[Dict[str, Any]] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        try:
            self.effect = parse_effect(payload)
        except Exception:
            self.effect = None

    def get(self) -> Optional[Dict[str, Any]]:
        return self.effect

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        if 'effect' in command and isinstance(command.get('effect'), dict):
            e = command.get('effect')
            frames.append({'op': 'effect', 'name': e.get('name'), 'speed': e.get('speed')})
        return frames


__all__ = ['EffectState']

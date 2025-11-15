"""Mic mode state minimal implementation for RGBIC devices."""
from __future__ import annotations

from typing import Any, Dict, Optional


class MicModeState:
    def __init__(self, device: Any):
        self.device = device
        self.enabled: Optional[bool] = None
        self.sensitivity: Optional[int] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        if not payload:
            return
        if 'mic' in payload:
            v = payload.get('mic')
            if isinstance(v, dict):
                self.enabled = bool(v.get('enabled', False))
                try:
                    self.sensitivity = int(v.get('sensitivity'))
                except Exception:
                    self.sensitivity = None
            else:
                # legacy boolean/number
                if isinstance(v, (int, bool)):
                    self.enabled = bool(v)

    def get(self) -> Dict[str, Optional[Any]]:
        return {'enabled': self.enabled, 'sensitivity': self.sensitivity}


    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Encode mic-related command into frames.

        Accepts {'mic': {'enabled': bool, 'sensitivity': int}} or legacy
        {'mic': True/False} and produces a small frame describing the mic
        configuration.
        """
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        if 'mic' in command:
            v = command.get('mic')
            if isinstance(v, dict):
                frames.append({'op': 'mic', 'enabled': bool(v.get('enabled', False)), 'sensitivity': v.get('sensitivity')})
            else:
                frames.append({'op': 'mic', 'enabled': bool(v)})
        return frames

__all__ = ['MicModeState']


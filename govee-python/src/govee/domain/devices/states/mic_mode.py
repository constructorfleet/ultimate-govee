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


__all__ = ['MicModeState']


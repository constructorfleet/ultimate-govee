"""DIY mode minimal state for RGBIC devices."""
from __future__ import annotations

from typing import Any, Dict, Optional


class DiyModeState:
    def __init__(self, device: Any):
        self.device = device
        self.enabled: Optional[bool] = None
        self.pattern: Optional[str] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        if not payload:
            return
        v = payload.get('diy') or payload.get('diyMode')
        if isinstance(v, dict):
            self.enabled = bool(v.get('enabled', False))
            self.pattern = v.get('pattern')
        elif isinstance(v, (int, bool)):
            self.enabled = bool(v)

    def get(self) -> Dict[str, Optional[Any]]:
        return {'enabled': self.enabled, 'pattern': self.pattern}


__all__ = ['DiyModeState']


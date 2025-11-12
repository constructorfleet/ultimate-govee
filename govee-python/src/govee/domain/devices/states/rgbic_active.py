"""RGBICActiveState: minimal active/mode aggregator for RGBIC devices."""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class RGBICActiveState:
    def __init__(self, device: Any, sub_modes: Optional[List[Any]] = None):
        self.device = device
        self.sub_modes = sub_modes or []
        self.active_mode: Optional[str] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        # Look for 'mode' or 'active' keys as indicators
        if not payload:
            return
        if 'mode' in payload:
            self.active_mode = str(payload.get('mode'))
        elif 'active' in payload:
            self.active_mode = str(payload.get('active'))

    def get(self) -> Optional[str]:
        return self.active_mode


__all__ = ['RGBICActiveState']


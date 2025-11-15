"""IceMaker water empty state."""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class IceMakerWaterEmpty:
    def __init__(self, device: Any):
        self.device = device
        self.empty: Optional[bool] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        v = payload.get('waterEmpty') or payload.get('water_empty')
        if isinstance(v, (int, bool)):
            self.empty = bool(v)

    def get(self) -> Optional[bool]:
        return self.empty

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('waterEmpty')
        if v is not None:
            frames.append({'op': 'waterEmpty', 'v': bool(v)})
        return frames


__all__ = ['IceMakerWaterEmpty']

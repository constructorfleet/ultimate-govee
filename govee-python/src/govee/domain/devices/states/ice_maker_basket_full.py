"""IceMaker basket full state."""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class IceMakerBasketFull:
    def __init__(self, device: Any):
        self.device = device
        self.full: Optional[bool] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        v = payload.get('basketFull') or payload.get('basket_full')
        if isinstance(v, (int, bool)):
            self.full = bool(v)

    def get(self) -> Optional[bool]:
        return self.full

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('basketFull')
        if v is not None:
            frames.append({'op': 'basketFull', 'v': bool(v)})
        return frames


__all__ = ['IceMakerBasketFull']

"""Ice maker nugget size state."""
from __future__ import annotations

from typing import Any, Dict, Optional, List


class IceMakerNuggetSizeState:
    def __init__(self, device: Any):
        self.device = device
        self.size: Optional[str] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        v = payload.get('nuggetSize') or payload.get('nugget_size')
        if v is None:
            return
        try:
            # allow numeric codes or string names
            if isinstance(v, (int, float)):
                self.size = str(int(v))
            else:
                self.size = str(v)
        except Exception:
            self.size = None

    def get(self) -> Optional[str]:
        return self.size

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('nuggetSize') or command.get('nugget_size')
        if v is not None:
            frames.append({'op': 'nugget_size', 'v': v})
        return frames


__all__ = ['IceMakerNuggetSizeState']

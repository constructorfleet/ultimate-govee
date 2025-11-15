"""IceMaker scheduled start state minimal implementation."""
from __future__ import annotations

from typing import Any, Dict, Optional, List
from ..device_op_state import DeviceOpState

class IceMakerScheduledStart(DeviceOpState):
    def __init__(self, device: Any):
        super().__init__('scheduled_start', {})

    def parse(self, payload: Dict[str, Any]) -> None:
        v = payload.get('scheduledStart') or payload.get('scheduled_start')
        if isinstance(v, dict):
            self.state_value.next(v)

    def get(self) -> Optional[Dict[str, Any]]:
        return self.state_value.get_value()

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('scheduledStart') or command.get('scheduled_start')
        if v is None:
            return frames
        frames.append({'op': 'scheduledStart', 'data': v})
        return frames


__all__ = ['IceMakerScheduledStart']

"""IceMaker status state mapping."""
from __future__ import annotations

from typing import Any, Dict, Optional, List
from ..device_op_state import DeviceOpState

status_map = {
    0: 'STANDBY',
    1: 'MAKING_ICE',
    2: 'FULL',
    3: 'WASHING',
    4: 'FINISHED_WASHING',
    5: 'SCHEDULED',
}

class IceMakerStatusState(DeviceOpState):
    def __init__(self, device: Any):
        super().__init__('ice_maker_status', None)

    def parse(self, payload: Dict[str, Any]) -> None:
        v = payload.get('status')
        if v is None and isinstance(payload, dict):
            # try numeric code
            try:
                v = int(payload.get('statusCode'))
            except Exception:
                v = None
        if isinstance(v, int):
            self.state_value.next(status_map.get(v, 'STANDBY'))
        elif isinstance(v, str):
            self.state_value.next(v)

    def get(self) -> Optional[str]:
        return self.state_value.get_value()

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        # allow setting status by name or numeric code
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('status')
        if v is None:
            return frames
        frames.append({'op': 'status', 'v': v})
        return frames


__all__ = ['IceMakerStatusState']

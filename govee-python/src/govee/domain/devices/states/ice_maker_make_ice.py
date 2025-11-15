"""IceMaker making-ice derived state."""
from __future__ import annotations

from typing import Any, Dict, Optional, List
from govee.domain.devices.states.device_op_state import DeviceOpState

class IceMakerMakingIceState(DeviceOpState):
    def __init__(self, device: Any):
        super().__init__('make_ice', None)
        # subscribe to status state if present on device
        try:
            status = getattr(device, 'ice_maker_status_state', None)
            if status and hasattr(status, 'subscribe'):
                status.subscribe(lambda s: self._on_status_change(s))
        except Exception:
            pass

    def _on_status_change(self, status: Any) -> None:
        try:
            self.state_value.next(status == 'MAKING_ICE')
        except Exception:
            pass

    def parse(self, payload: Dict[str, Any]) -> None:
        # no direct parsing; relies on status subscription
        return

    def get(self) -> Optional[bool]:
        return self.state_value.get_value()

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        # toggling makeIce delegates to status set in a real device; here we
        # translate boolean to a status command
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('makeIce')
        if v is None:
            return frames
        frames.append({'op': 'makeIce', 'v': bool(v)})
        return frames


__all__ = ['IceMakerMakingIceState']

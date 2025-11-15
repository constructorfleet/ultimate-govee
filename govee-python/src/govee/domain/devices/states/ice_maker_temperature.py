"""IceMaker temperature state."""
from __future__ import annotations

from typing import Any, Dict, Optional, List
from govee.domain.devices.states.device_op_state import DeviceOpState
from ..temperature import parse_temperature

class IceMakerTemperatureState(DeviceOpState):
    def __init__(self, device: Any):
        super().__init__('ice_maker_temperature', None)

    def parse(self, payload: Dict[str, Any]) -> None:
        cur, cal, probes = parse_temperature(payload)
        if cur is not None:
            self.state_value.next({'current': cur, 'range': {'min': -20, 'max': 60}, 'unit': 'C'})

    def get(self) -> Optional[Dict[str, Any]]:
        return self.state_value.get_value()

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        # temperature setting not supported; no-op
        return []


__all__ = ['IceMakerTemperatureState']

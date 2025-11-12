"""Minimal Sensor device implementation: battery, temperature, humidity."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device_base import DeviceBase
from ..models import DeviceState, parse_state


class SensorDevice(DeviceBase):
    def __init__(
        self, id: str, model: Optional[str] = None, name: Optional[str] = None
    ):
        super().__init__(id=id, model=model, name=name)

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        st = parse_state(payload or {})
        self._state = st
        # parse any temp probes and calibration into state if present
        # parse_state already populates temperature, temperature_calibration and temp_probes
        # ensure temp_probes is a dict of int->float
        if self._state.temp_probes and isinstance(self._state.temp_probes, dict):
            # ensure numeric keys
            self._state.temp_probes = {int(k): float(v) for k, v in self._state.temp_probes.items()}

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        # sensors do not typically accept commands; return empty list
        return []


__all__ = ["SensorDevice"]

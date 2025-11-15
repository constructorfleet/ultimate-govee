"""Minimal IceMaker device stub for tests."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device_base import DeviceBase
from ..states.power import PowerState
from ..states.connected import parse_connected
from ..states.active import parse_active
from ..states.temperature import parse_temperature
from ..states.ice_maker_nugget_size import IceMakerNuggetSizeState


class IceMakerDevice(DeviceBase):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)
        # register ice maker specific states
        self.register_state_factories([
            PowerState,
            IceMakerNuggetSizeState,
        ])
        self.parse_states({})

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        # let base parse into DeviceState and parse registered states
        super().apply_payload(payload)
        self.parse_states(payload)

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames = []
        for st in getattr(self, '_states', []):
            try:
                enc = getattr(st, 'encode', None)
                if callable(enc):
                    frames.extend(enc(command or {}))
            except Exception:
                continue
        return frames


__all__ = ["IceMakerDevice"]


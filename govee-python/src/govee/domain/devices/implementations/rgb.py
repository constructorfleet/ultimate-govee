"""RGB device implementation: minimal mapping and command encoding.

This provides a small RGBDevice class used by domain tests to model RGB
lights. It knows how to apply incoming state payloads and encode simple
commands for power, brightness and RGB color.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device import Device
from ..models import DeviceState
from ..encoding import encode_power, encode_brightness, encode_rgb


class RGBDevice(Device):
    def __init__(
        self, id: str, model: Optional[str] = None, name: Optional[str] = None
    ):
        super().__init__(id=id, model=model, name=name)
        self._state: DeviceState = DeviceState()

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        """Merge an incoming payload into internal state using existing parsers."""
        # reuse parse_state logic by importing here to avoid circulars in module load
        from ..models import parse_state

        st = parse_state(payload or {})
        self._state = st

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Encode a high-level command dict into a list of low-level frames.

        Minimal encoding rules implemented for tests:
          - {'power': True/False} -> [{'op':'power','v':1/0}]
          - {'brightness': N} -> [{'op':'bright','v':N}]
          - {'color': {'r':R,'g':G,'b':B}} -> [{'op':'rgb','r':R,'g':G,'b':B}]
        """
        frames: List[Dict[str, Any]] = []
        frames.extend(encode_power(command))
        frames.extend(encode_brightness(command))
        frames.extend(encode_rgb(command))
        return frames


__all__ = ["RGBDevice"]

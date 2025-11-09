"""RGB device implementation: minimal mapping and command encoding.

This provides a small RGBDevice class used by domain tests to model RGB
lights. It knows how to apply incoming state payloads and encode simple
commands for power, brightness and RGB color.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device import Device
from ..models import DeviceState


class RGBDevice(Device):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
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
        if "power" in command:
            frames.append({"op": "power", "v": 1 if bool(command.get("power")) else 0})
        if "brightness" in command:
            try:
                v = int(command.get("brightness"))
            except Exception:
                v = 0
            frames.append({"op": "bright", "v": max(0, min(100, v))})
        if "color" in command and isinstance(command.get("color"), dict):
            c = command.get("color")
            frames.append({"op": "rgb", "r": int(c.get("r", 0)), "g": int(c.get("g", 0)), "b": int(c.get("b", 0))})
        return frames


__all__ = ["RGBDevice"]

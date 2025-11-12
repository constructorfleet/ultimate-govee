"""Minimal White-temperature (color temp) device implementation.

Provides a small Device class that handles power, brightness and color
temperature fields and can encode simple frames for them.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device_base import DeviceBase
from ..models import DeviceState, parse_state


class WhiteTempDevice(DeviceBase):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        st = parse_state(payload or {})
        self._state = st

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if "power" in command:
            frames.append({"op": "power", "v": 1 if bool(command.get("power")) else 0})
        if "brightness" in command:
            try:
                v = int(command.get("brightness"))
            except Exception:
                v = 0
            frames.append({"op": "bright", "v": max(0, min(100, v))})
        if "color_temp" in command:
            try:
                v = int(command.get("color_temp"))
            except Exception:
                v = 0
            frames.append({"op": "ct", "v": v})
        return frames


__all__ = ["WhiteTempDevice"]

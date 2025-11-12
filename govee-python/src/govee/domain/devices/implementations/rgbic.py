"""Minimal RGBIC (addressable LED strip) device implementation.

This provides a small class used by the new tests. It intentionally
implements only the minimal surface area required by tests: apply_payload,
get_state and encode_command producing simple frames.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device import Device
from ..device_base import DeviceBase
from ..models import DeviceState, parse_state


class RGBICDevice(DeviceBase):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)
        # segments: list of dicts with index, length, color
        self.segments: List[Dict[str, Any]] = []

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        st = parse_state(payload or {})
        self._state = st
        segs = payload.get("segments") or []
        # normalize simple segment shapes
        self.segments = []
        for s in segs:
            seg = {"index": int(s.get("index", 0)), "length": int(s.get("length", 0))}
            if "color" in s and isinstance(s["color"], dict):
                seg["color"] = {"r": int(s["color"].get("r", 0)), "g": int(s["color"].get("g", 0)), "b": int(s["color"].get("b", 0))}
            self.segments.append(seg)

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

        # segments — encode a simple 'seg' frame for each provided segment
        for s in command.get("segments", []):
            idx = int(s.get("index", 0))
            c = s.get("color") or {}
            frames.append({"op": "seg", "index": idx, "r": int(c.get("r", 0)), "g": int(c.get("g", 0)), "b": int(c.get("b", 0))})

        # effects
        if "effect" in command and isinstance(command.get("effect"), dict):
            e = command.get("effect")
            frames.append({"op": "effect", "name": e.get("name"), "speed": e.get("speed")})

        return frames


__all__ = ["RGBICDevice"]

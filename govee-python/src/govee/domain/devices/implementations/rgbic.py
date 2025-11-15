"""Minimal RGBIC (addressable LED strip) device implementation.

This provides a small class used by the new tests. It intentionally
implements only the minimal surface area required by tests: apply_payload,
get_state and encode_command producing simple frames.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device_base import DeviceBase
from ..models import DeviceState, parse_state
from ..encoding import encode_power, encode_brightness, encode_segment
from ..states.segment_color_mode import SegmentColorModeState
from ..states.color_rgb import ColorRGBState
from ..states.scene_mode import SceneModeState
from ..states.mic_mode import MicModeState
from ..states.diy_mode import DiyModeState
from ..states.rgbic_active import RGBICActiveState
from ..states.effect import parse_effect


class RGBICDevice(DeviceBase):
    def __init__(
        self, id: str, model: Optional[str] = None, name: Optional[str] = None
    ):
        super().__init__(id=id, model=model, name=name)
        # segments: list of dicts with index, length, color
        self.segments: List[Dict[str, Any]] = []

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        st = parse_state(payload or {})
        self._state = st
        segs = payload.get("segments") or []
        # Support pixel array payloads (some firmwares report pixels directly)
        px = payload.get("pixels")
        if px is not None and isinstance(px, list):
            # normalize pixels to list of [r,g,b]
            self.pixels = [list(map(int, p)) for p in px]
        else:
            # ensure pixels attribute always exists
            self.pixels = getattr(self, "pixels", [])
        # normalize simple segment shapes
        self.segments = []
        for s in segs:
            seg = {"index": int(s.get("index", 0)), "length": int(s.get("length", 0))}
            if "color" in s and isinstance(s["color"], dict):
                seg["color"] = {
                    "r": int(s["color"].get("r", 0)),
                    "g": int(s["color"].get("g", 0)),
                    "b": int(s["color"].get("b", 0)),
                }
            self.segments.append(seg)
        # register and parse all state factories in bulk
        # instantiate standard state classes and let base parse iterate them
        # register state classes directly
        self.register_state_factories([
            SegmentColorModeState,
            ColorRGBState,
            SceneModeState,
            MicModeState,
            DiyModeState,
            RGBICActiveState,
        ])
        # parse registered states
        self.parse_states(payload)
        # effect parse remains ad-hoc (returns dict)
        eff = parse_effect(payload)
        self.effect_state = eff

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        frames.extend(encode_power(command))
        frames.extend(encode_brightness(command))
        # support whole-device RGB color
        from ..encoding import encode_rgb
        frames.extend(encode_rgb(command))

        for s in command.get("segments", []):
            idx = int(s.get("index", 0))
            c = s.get("color") or {}
            frames.append(encode_segment(idx, {"r": int(c.get("r", 0)), "g": int(c.get("g", 0)), "b": int(c.get("b", 0))}))

        # pixel array encoding (simple frame with op 'pixels')
        if "pixels" in command and isinstance(command.get("pixels"), list):
            frames.append({"op": "pixels", "pixels": [list(map(int, p)) for p in command.get("pixels")]})

        if "effect" in command and isinstance(command.get("effect"), dict):
            e = command.get("effect")
            frames.append({"op": "effect", "name": e.get("name"), "speed": e.get("speed")})

        return frames


__all__ = ["RGBICDevice"]

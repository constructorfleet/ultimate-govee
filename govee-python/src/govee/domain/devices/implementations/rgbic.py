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
from ..states.power import PowerState
from ..states.brightness import BrightnessState


class RGBICDevice(DeviceBase):
    def __init__(
        self, id: str, model: Optional[str] = None, name: Optional[str] = None
    ):
        super().__init__(id=id, model=model, name=name)
        # segments: list of dicts with index, length, color
        self.segments: List[Dict[str, Any]] = []
        # register state factories upfront so encode_command can delegate
        # even when no payload has been applied yet.
        self.register_state_factories([
            SegmentColorModeState,
            ColorRGBState,
            SceneModeState,
            MicModeState,
            DiyModeState,
            RGBICActiveState,
            PowerState,
            BrightnessState,
        ])
        # initialize parsed states with empty payload
        self.parse_states({})

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
        # parse registered states (registered in __init__)
        self.parse_states(payload)
        # effect parse remains ad-hoc (returns dict)
        eff = parse_effect(payload)
        self.effect_state = eff

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Prefer delegating encoding to registered states. This lets states
        # encapsulate the mapping from high-level command keys to low-level
        # frames and keeps the device class focused on composition.
        frames: List[Dict[str, Any]] = []
        # Common shared encoders still handled here for power/brightness
        frames.extend(encode_power(command))
        frames.extend(encode_brightness(command))

        # Let states encode their portion of the command when they expose
        # an `encode(command)` method. This mirrors parse_states which calls
        # each state's parse(payload).
        for st in getattr(self, '_states', []):
            try:
                enc = getattr(st, 'encode', None)
                if callable(enc):
                    sframes = enc(command or {})
                    if isinstance(sframes, list):
                        frames.extend(sframes)
            except Exception:
                # swallow encoding errors per-device
                continue

        # pixel array encoding (simple frame with op 'pixels')
        if "pixels" in command and isinstance(command.get("pixels"), list):
            frames.append({"op": "pixels", "pixels": [list(map(int, p)) for p in command.get("pixels")]})

        # effect encoding remains ad-hoc
        if "effect" in command and isinstance(command.get("effect"), dict):
            e = command.get("effect")
            frames.append({"op": "effect", "name": e.get("name"), "speed": e.get("speed")})

        return frames


__all__ = ["RGBICDevice"]

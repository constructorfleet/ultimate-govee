"""RGB device implementation: minimal mapping and command encoding.

This provides a small RGBDevice class used by domain tests to model RGB
lights. It knows how to apply incoming state payloads and encode simple
commands for power, brightness and RGB color.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device_base import DeviceBase
from ..models import DeviceState
from ..encoding import encode_power, encode_brightness, encode_rgb
from ..states.color_rgb import ColorRGBState
from ..states.brightness import parse_brightness
from ..states.power import parse_power
from ..states.color_temp import ColorTempState


class RGBDevice(DeviceBase):
    def __init__(
        self, id: str, model: Optional[str] = None, name: Optional[str] = None
    ):
        super().__init__(id=id, model=model, name=name)
        self._state: DeviceState = DeviceState()
        # register state factories inline for automatic parsing and encoding
        from ..states.color_rgb import ColorRGBState as _ColorRGBState
        from ..states.power import PowerState as _PowerState
        from ..states.brightness import BrightnessState as _BrightnessState
        # simple list of classes to instantiate and later parse/encode
        self.register_state_factories([_ColorRGBState, _PowerState, _BrightnessState])
        # parse any registered states
        self.parse_states({})

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        """Merge an incoming payload into internal state using existing parsers."""
        # reuse parse_state logic by importing here to avoid circulars in module load
        from ..models import parse_state

        st = parse_state(payload or {})
        self._state = st
        # parse derived helper states for parity (registered above)
        self.parse_states(payload)
        # color temperature state
        try:
            ct = ColorTempState()
            ct.parse_state(payload)
            self.color_temp_state = ct
        except Exception:
            self.color_temp_state = None

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
        # delegate to registered states for encoding (power/brightness/color)
        for st in getattr(self, '_states', []):
            try:
                enc = getattr(st, 'encode', None)
                if callable(enc):
                    sframes = enc(command or {})
                    if isinstance(sframes, list):
                        frames.extend(sframes)
            except Exception:
                continue
        return frames


__all__ = ["RGBDevice"]

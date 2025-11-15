"""Brightness parsing helpers for device payloads."""

from __future__ import annotations

from typing import Optional


def parse_brightness(payload: dict) -> Optional[int]:
    """Parse brightness from payload.

    Accepts numeric values, numeric strings, or keys like 'bright'.
    Normalizes to an int if present, otherwise returns None. Clamps to
    the 0-100 range when possible.
    """
    if payload is None:
        return None
    val = None
    if "brightness" in payload:
        val = payload.get("brightness")
    elif "bright" in payload:
        val = payload.get("bright")

    if val is None:
        return None

    try:
        if isinstance(val, str):
            v = int(float(val))
        else:
            v = int(val)
    except Exception:
        return None

    # clamp
    if v < 0:
        v = 0
    if v > 100:
        v = 100
    return v


__all__ = ["parse_brightness"]


class BrightnessState:
    """Minimal Brightness state wrapper to integrate with DeviceBase.

    Provides parse/get/encode so device implementations can register the
    state class and rely on parse_states/encode delegation.
    """
    def __init__(self, device: object):
        self.device = device
        self.brightness: Optional[int] = None

    def parse(self, payload: dict) -> None:
        try:
            self.brightness = parse_brightness(payload)
        except Exception:
            self.brightness = None

    def get(self) -> Optional[int]:
        return self.brightness

    def encode(self, command: dict) -> list:
        from ..encoding import encode_brightness

        try:
            return encode_brightness(command or {})
        except Exception:
            return []

__all__.append('BrightnessState')

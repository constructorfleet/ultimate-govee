"""Power state parsing helpers."""

from __future__ import annotations

from typing import Optional


def parse_power(payload: dict) -> Optional[bool]:
    """Parse power information from a device payload.

    Accepts common keys: 'power', 'on', numeric 0/1 and boolean values.
    Returns True/False when present or None when not specified.
    """
    if payload is None:
        return None
    if "power" in payload:
        v = payload.get("power")
    elif "on" in payload:
        v = payload.get("on")
    else:
        return None

    # normalize numeric representations
    if isinstance(v, (int, float)):
        return bool(int(v))
    if isinstance(v, str):
        if v.isdigit():
            return bool(int(v))
        lower = v.strip().lower()
        if lower in ("true", "on", "1"):
            return True
        if lower in ("false", "off", "0"):
            return False
    if isinstance(v, bool):
        return v
    return None


__all__ = ["parse_power"]


class PowerState:
    """Minimal Power state wrapper to integrate with DeviceBase.

    Provides parse/get/encode so device implementations can register the
    state class and rely on parse_states/encode delegation.
    """
    def __init__(self, device: object):
        self.device = device
        self.power: Optional[bool] = None

    def parse(self, payload: dict) -> None:
        try:
            self.power = parse_power(payload)
        except Exception:
            self.power = None

    def get(self) -> Optional[bool]:
        return self.power

    def encode(self, command: dict) -> list:
        """Delegate encoding of power-related commands to shared helper."""
        from ..encoding import encode_power

        try:
            return encode_power(command or {})
        except Exception:
            return []

__all__.append('PowerState')

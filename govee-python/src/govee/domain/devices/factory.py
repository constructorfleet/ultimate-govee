"""Device factory helpers: create Device instances based on model patterns.

This is a minimal factory used by domain tests: it maps known model
prefixes to lightweight DeviceDescriptor shapes and can be extended with
model-specific logic.
"""

from __future__ import annotations

from typing import Optional

from .device import Device
from .implementations.rgbic import RGBICDevice


def make_device_from_advert(model: str, payload: dict) -> Optional[Device]:
    # minimal heuristics: when model starts with 'H' or 'M' consider it a
    # known Govee device; otherwise unknown.
    if not model:
        return None
    m = str(model)
    # simple mapping: treat models containing 'RGBIC' as addressable strips
    if "RGBIC" in m.upper():
        return RGBICDevice(id=payload.get("id") or payload.get("device"), model=model, name=payload.get("name"))
    if m.startswith(("H", "M")):
        return Device(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name") or f"Govee-{model}",
            firmware=payload.get("version"),
            addresses={"mac": payload.get("mac"), "ip": payload.get("ip")},
        )
    return None


__all__ = ["make_device_from_advert"]

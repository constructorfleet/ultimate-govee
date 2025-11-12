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
        return RGBICDevice(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name"),
        )
    # If payload contains deviceExt.deviceSettings.ic > 0, treat as RGBIC strip
    try:
        device_ext = payload.get("deviceExt") or {}
        device_settings = device_ext.get("deviceSettings") if isinstance(device_ext, dict) else None
        ic_val = None
        if isinstance(device_settings, dict):
            ic_val = device_settings.get("ic")
        if ic_val is None:
            # also accept top-level ic
            ic_val = payload.get("ic")
        if ic_val is not None and int(ic_val) > 0:
            return RGBICDevice(
                id=payload.get("id") or payload.get("device"), model=model, name=payload.get("name")
            )
    except Exception:
        pass
    if "WT" in m.upper() or "WHITE" in m.upper() or "CT" in m.upper():
        # map simple white-temp model patterns to WhiteTempDevice
        from .implementations.whitetemp import WhiteTempDevice

        return WhiteTempDevice(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name"),
        )
    if "WT" in m.upper() or "WHITE" in m.upper() or "CT" in m.upper():
        # map simple white-temp model patterns to WhiteTempDevice
        from .implementations.whitetemp import WhiteTempDevice

        return WhiteTempDevice(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name"),
        )
    if "S-" in m.upper() or "SENSOR" in m.upper():
        from .implementations.sensor import SensorDevice

        return SensorDevice(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name"),
        )
    # simple white / night-light heuristics
    if "NIGHT" in m.upper() or "NIGHTLIGHT" in m.upper() or "NIGHT" in str(payload.get("name", "")).upper():
        from .implementations.night import NightDevice

        return NightDevice(id=payload.get("id") or payload.get("device"), model=model, name=payload.get("name"))
    if "WHITE" in m.upper() or m.startswith("H6") or "CT" in m.upper() or "RGB" not in m.upper():
        # fallback: treat many H6xx models as white-type if not RGB
        from .implementations.white import WhiteDevice

        return WhiteDevice(id=payload.get("id") or payload.get("device"), model=model, name=payload.get("name"))
    if m.startswith(("H", "M")):
        return Device(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name") or f"Govee-{model}",
            firmware=payload.get("version"),
            addresses={"mac": payload.get("mac") if payload.get("mac") is not None else payload.get("deviceMac"), "ip": payload.get("ip")},
        )
    return None


__all__ = ["make_device_from_advert"]

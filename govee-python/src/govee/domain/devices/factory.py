"""Device factory helpers: create Device instances based on model patterns.

This is a minimal factory used by domain tests: it maps known model
prefixes to lightweight DeviceDescriptor shapes and can be extended with
model-specific logic.
"""

from __future__ import annotations

from typing import Optional

from .device import Device
from .implementations.rgbic import RGBICDevice
from .implementations.hygrometer import HygrometerDevice


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

    if m.startswith(("H", "M")):
        # Basic mapping heuristics: instantiate specific sensor/device classes
        # for known categories found in product JSON. For hygrometers, if
        # the model or name contains 'hygrometer' return HygrometerDevice.
        if 'hygrometer' in (str(model or '') + ' ' + str(payload.get('productName') or '')).lower():
            return HygrometerDevice(id=payload.get('id') or payload.get('device'), model=model, name=payload.get('name'))

        return Device(
            id=payload.get("id") or payload.get("device"),
            model=model,
            name=payload.get("name") or f"Govee-{model}",
            firmware=payload.get("version"),
            addresses={"mac": payload.get("mac") if payload.get("mac") is not None else payload.get("deviceMac"), "ip": payload.get("ip")},
        )
    return None


__all__ = ["make_device_from_advert"]

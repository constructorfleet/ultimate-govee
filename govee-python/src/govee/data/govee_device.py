"""Data models for Govee devices.

This is a minimal translation of lib/data/govee-device.ts providing a
dataclass for device metadata and a helper to create devices from a
LAN-discovery-like payload used in tests and fixtures.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class GoveeDevice:
    device_id: str
    model: Optional[str] = None
    name: Optional[str] = None
    firmware: Optional[str] = None
    addresses: Dict[str, Optional[str]] = None


def from_lan_payload(payload: Dict[str, Any]) -> GoveeDevice:
    """Create a GoveeDevice from a typical LAN discovery payload.

    Example payload used in tests:
    {
        "device": "1234",
        "model": "H6009",
        "name": "Living Room",
        "version": "1.2.3",
        "ip": "192.168.1.10",
        "mac": "AA:BB:CC:DD:EE:FF",
    }
    """
    device_id = payload.get("device") or payload.get("deviceId") or payload.get("id")
    if not device_id:
        raise ValueError("payload missing device id")

    addresses = {"ip": payload.get("ip"), "mac": payload.get("mac")}
    return GoveeDevice(
        device_id=str(device_id),
        model=payload.get("model"),
        name=payload.get("name"),
        firmware=payload.get("version"),
        addresses=addresses,
    )

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any, Optional


@dataclass
class Device:
    id: str
    model: Optional[str] = None
    name: Optional[str] = None
    firmware: Optional[str] = None
    addresses: Dict[str, Optional[str]] = None


def from_payload(payload: Dict[str, Any]) -> Device:
    device_id = payload.get("device") or payload.get("id")
    if not device_id:
        raise ValueError("missing device id")
    return Device(
        id=str(device_id),
        model=payload.get("model"),
        name=payload.get("name"),
        firmware=payload.get("version"),
        addresses={"ip": payload.get("ip"), "mac": payload.get("mac")},
    )

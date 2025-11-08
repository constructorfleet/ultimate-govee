from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any, Optional


@dataclass
class DeviceState:
    power: Optional[bool] = None
    brightness: Optional[int] = None
    color: Optional[str] = None


def parse_state(payload: Dict[str, Any]) -> DeviceState:
    return DeviceState(
        power=bool(payload.get("power")) if "power" in payload else None,
        brightness=payload.get("brightness"),
        color=payload.get("color"),
    )


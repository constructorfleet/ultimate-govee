from __future__ import annotations

from typing import Any, Dict

from .models import parse_state


class DevicesService:
    def __init__(self) -> None:
        self._devices: Dict[str, Dict[str, Any]] = {}

    def update_state(self, device_id: str, payload: Dict[str, Any]) -> None:
        state = parse_state(payload)
        self._devices.setdefault(device_id, {})["state"] = state

    def get_state(self, device_id: str):
        return self._devices.get(device_id, {}).get("state")

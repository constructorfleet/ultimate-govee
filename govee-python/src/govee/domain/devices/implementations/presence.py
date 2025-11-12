"""Minimal Presence sensor device stub for tests."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..device_base import DeviceBase


class PresenceDevice(DeviceBase):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        super().apply_payload(payload)

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        return []


__all__ = ["PresenceDevice"]


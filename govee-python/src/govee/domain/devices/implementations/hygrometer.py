"""Hygrometer sensor device (minimal).
"""
from __future__ import annotations

from typing import Any, Dict, Optional, List

from ..device_base import DeviceBase


class HygrometerDevice(DeviceBase):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        # reuse base parse behaviour
        super().apply_payload(payload)

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        # sensors generally do not accept commands; return empty list
        return []


__all__ = ["HygrometerDevice"]


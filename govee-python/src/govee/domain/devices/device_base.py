"""Common base class for device implementations.

DeviceBase extends the simple Device dataclass with a common surface area
for concrete implementations: apply_payload, get_state and encode_command.
This allows implementations to inherit shared behavior and keeps the
implementations lightweight for tests.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .device import Device
from .models import DeviceState


class DeviceBase(Device):
    """Minimal base for device implementations.

    Concrete implementations should override apply_payload and encode_command
    as needed. get_state returns a DeviceState instance stored on the
    implementation (default None).
    """

    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)
        self._state: DeviceState = DeviceState()

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        """Apply an incoming payload to the device state.

        Default implementation stores nothing; concrete classes should
        populate self._state and other attributes.
        """
        raise NotImplementedError()

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Encode a high-level command to a list of frames.

        Concrete implementations should provide encoding logic; default
        returns an empty list.
        """
        return []


__all__ = ["DeviceBase"]

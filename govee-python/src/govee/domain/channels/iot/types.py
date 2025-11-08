"""IoT channel types minimal for tests."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class IotMessage:
    topic: str
    payload: dict



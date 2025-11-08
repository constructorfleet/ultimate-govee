"""IoT channel service minimal stub for tests."""
from __future__ import annotations

from typing import List
from .types import IotMessage


class IotService:
    def __init__(self) -> None:
        self.published: List[IotMessage] = []

    def publish(self, msg: IotMessage) -> None:
        self.published.append(msg)


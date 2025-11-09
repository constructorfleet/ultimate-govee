from __future__ import annotations

from dataclasses import dataclass


@dataclass
class DeviceDescriptor:
    id: str
    model: str
    name: str

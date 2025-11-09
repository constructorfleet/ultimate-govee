from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class SenderState(Enum):
    UNBOUND = "UNBOUND"
    BINDING = "BINDING"
    BOUND = "BOUND"
    SCANNING = "SCANNING"
    CONNECTED = "CONNECTED"
    ERROR = "ERROR"
    CLOSED = "CLOSED"


@dataclass
class MessageEvent:
    message: bytes
    remote_info: tuple

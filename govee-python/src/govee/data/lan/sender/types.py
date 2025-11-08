from __future__ import annotations

from enum import Enum
from dataclasses import dataclass


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


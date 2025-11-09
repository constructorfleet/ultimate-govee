from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class ReceiverState(Enum):
    UNBOUND = "UNBOUND"
    BINDING = "BINDING"
    BOUND = "BOUND"
    LISTENING = "LISTENING"
    CONNECTED = "CONNECTED"
    ERROR = "ERROR"
    CLOSED = "CLOSED"


@dataclass
class MessageEvent:
    message: bytes
    remote_info: tuple

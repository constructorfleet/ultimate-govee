"""IoT channel types minimal for tests."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class IotMessage:
    """Representation of an IoT/MQTT message used by tests.

    The payload is intentionally typed as Any to allow tests to provide a
    pre-serialized JSON string or a native Python dict/object. Keeping this
    flexible makes assertions in unit tests easier without coupling to a
    concrete serialization format.
    """

    topic: str
    payload: Any



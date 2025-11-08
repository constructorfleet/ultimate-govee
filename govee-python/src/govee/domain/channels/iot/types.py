"""IoT channel types minimal for tests."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class IotMessage:
    """Representation of an IoT/MQTT message used by tests.

    The payload is intentionally typed as Any to allow tests to provide a
    pre-serialized JSON string or a native Python dict/object. Keeping this
    flexible makes assertions in unit tests easier without coupling to a
    concrete serialization format.

    A retained flag is included to emulate MQTT retained messages in tests.
    """

    topic: str
    payload: Any
    retained: Optional[bool] = False
    # optional QoS and timestamp metadata for tests
    qos: Optional[int] = None
    timestamp: Optional[float] = None



"""Optional real MQTT backend adapter using paho-mqtt.

This module provides a thin wrapper around paho.mqtt.client. It is an
optional runtime dependency; if paho is not installed the adapter will raise
ImportError when attempting to create a real client. For our offline tests we
use the FakeMQTTBackend implemented in mqtt_adapter.py.
"""
from __future__ import annotations

try:
    import paho.mqtt.client as mqtt  # type: ignore
except Exception as e:  # pragma: no cover - optional dependency
    mqtt = None  # type: ignore

from typing import Any, Optional


class PahoAdapter:
    def __init__(self, client_id: Optional[str] = None):
        if mqtt is None:
            raise ImportError("paho-mqtt is required for PahoAdapter")
        self.client = mqtt.Client(client_id=client_id)

    def connect(self, host: str, port: int = 1883, keepalive: int = 60):
        self.client.connect(host, port, keepalive)

    def disconnect(self):
        self.client.disconnect()

    def publish(self, topic: str, payload: Any, qos: int = 0, retain: bool = False):
        self.client.publish(topic, payload, qos=qos, retain=retain)

    def subscribe(self, topic: str, qos: int = 0):
        self.client.subscribe(topic, qos=qos)

    # real-world code would include callbacks and loop handling


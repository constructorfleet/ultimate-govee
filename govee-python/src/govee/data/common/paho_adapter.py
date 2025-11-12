"""Optional real MQTT backend adapter using paho-mqtt.

This module provides a thin wrapper around paho.mqtt.client. It is an
optional runtime dependency; if paho is not installed the adapter will raise
ImportError when attempting to create a real client. For our offline tests we
use the FakeMQTTBackend implemented in mqtt_adapter.py.
"""

from __future__ import annotations

try:
    import paho.mqtt.client as mqtt  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    mqtt = None  # type: ignore

import threading
import time
from typing import Any, Optional, Sequence

from govee.data.iot.iot_client import AsyncIotMessage


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


class PahoBackend:
    """Backend that attaches a paho client to an IoTClient instance.

    This wrapper is intentionally small: it connects to a broker, subscribes
    to a set of topics, and forwards inbound messages to the provided
    IoTClient.simulate_incoming as AsyncIotMessage objects. It runs the
    paho network loop in a background thread.
    """

    def __init__(
        self, host: str, port: int = 1883, topics: Optional[Sequence[str]] = None
    ):
        if mqtt is None:
            raise ImportError("paho-mqtt is required for PahoBackend")
        self.host = host
        self.port = port
        self.topics = list(topics or ["#"])
        self._client = mqtt.Client()
        self._thread: Optional[threading.Thread] = None

    def attach(self, iot_client):
        # Configure callbacks to forward messages into the provided iot_client.
        # Do not perform network connect here — creation/attachment should be
        # side-effect free to allow test-time attachment without a broker.
        def on_connect(client, userdata, flags, rc):
            for t in self.topics:
                client.subscribe(t)

        def on_message(client, userdata, msg):
            try:
                import json

                payload = None
                if msg.payload:
                    try:
                        payload = json.loads(msg.payload.decode("utf-8"))
                    except Exception:
                        payload = msg.payload.decode("utf-8")
                a = AsyncIotMessage(
                    topic=msg.topic,
                    payload=payload,
                    qos=msg.qos,
                    retained=bool(msg.retain),
                )
                # forward into IoT client
                iot_client.simulate_incoming(a)
            except Exception:
                pass

        self._client.on_connect = on_connect
        self._client.on_message = on_message

        # Note: do not call connect() here so tests may attach a PahoBackend
        # without requiring an actual broker. To perform a real connection,
        # call the connect() method on this PahoBackend instance which will
        # start the background network loop.
        self._attached = True

    def connect(self, max_attempts: int = 3, initial_backoff: float = 0.1):
        """Connect to the configured broker, retrying on failure.

        This method starts the paho network loop in a background thread on
        success. It retries up to max_attempts with exponential backoff.
        """
        attempt = 0
        backoff = initial_backoff
        last_exc = None
        while attempt < max_attempts:
            attempt += 1
            try:
                self._client.connect(self.host, self.port, 60)
                # start loop thread
                try:
                    self._client.loop_start()
                except Exception:
                    pass
                self._connected = True
                return
            except Exception as exc:
                last_exc = exc
                time.sleep(backoff)
                backoff = min(backoff * 2, 60)
        if last_exc:
            raise last_exc

    def stop(self):
        try:
            try:
                self._client.loop_stop()
            except Exception:
                pass
            # attempt to unsubscribe from topics if backend tracked them
            try:
                for t in list(self.topics):
                    try:
                        if hasattr(self._client, "unsubscribe"):
                            self._client.unsubscribe(t)
                    except Exception:
                        pass
            except Exception:
                pass
            self._client.disconnect()
        except Exception:
            pass
        self._thread = None
        self._connected = False

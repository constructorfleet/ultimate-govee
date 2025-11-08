"""IoT channel service minimal stub for tests.

This provides a lightweight in-memory implementation of an MQTT/IoT
client used by the test-suite. It mirrors the JS/TS implementation in
lib/data/iot as needed for tests: connect, disconnect, subscribe and
publish/send. The real project talks to AWS IoT Core; tests only need a
recording stub.
"""

from __future__ import annotations

from typing import Callable, List, Optional
from .types import IotMessage


class IotService:
    """Lightweight in-memory IoT service used by unit tests.

    Methods:
      - connect(iot_data, callback): mark connected and record a message
        callback to emulate incoming messages.
      - disconnect(): mark disconnected.
      - subscribe(topic): record subscription.
      - send(topic, payload): record outgoing publish as IotMessage.
      - publish(msg): compatibility alias for send when given an IotMessage.
    """

    def __init__(self) -> None:
        self.published: List[IotMessage] = []
        self.subscriptions: List[str] = []
        self.connected: bool = False
        # store the last iot_data passed to connect for higher-level tests
        self.iot_data: Optional[object] = None
        # support multiple callbacks
        self._callbacks: List[Callable[[IotMessage], None]] = []

    def connect(self, iot_data: object = None, callback: Optional[Callable[[IotMessage], None]] = None) -> None:
        """Simulate connecting to an MQTT broker.

        iot_data is accepted for API-compatibility with the TS implementation
        but not used in the test stub. If a callback is provided it will be
        stored and may be invoked by tests to emulate incoming messages.
        """
        self.connected = True
        # persist the iot_data for tests that need access to the connection info
        self.iot_data = iot_data
        if callback is not None:
            self._callbacks.append(callback)

    def disconnect(self) -> None:
        """Simulate disconnecting from the broker."""
        self.connected = False
        self._callbacks = []
        # clear stored iot_data on disconnect
        self.iot_data = None

    def subscribe(self, topic: str) -> None:
        if topic not in self.subscriptions:
            self.subscriptions.append(topic)

    def _topic_matches_subscription(self, topic: str, subscription: str) -> bool:
        """Very small topic matching helper.

        Supports exact match and a single '#' suffix wildcard meaning "prefix match".
        For example:
          - 'govee/device/42' matches 'govee/device/42'
          - 'govee/device/42' matches 'govee/device/#' (prefix match)

        This is intentionally minimal to satisfy unit tests; the real
        implementation would implement full MQTT topic wildcard semantics.
        """
        if subscription.endswith('/#'):
            prefix = subscription[:-2]
            return topic.startswith(prefix)
        if subscription.endswith('#') and subscription != '#':
            # allow 'govee/device/#' or 'govee/#' styles
            prefix = subscription[:-1]
            return topic.startswith(prefix)
        return topic == subscription

    def send(self, topic: str, payload: object) -> None:
        """Record a published message.

        The payload in the TS implementation is a JSON string. To keep tests
        flexible we accept either a dict/object or a pre-serialized string.
        """
        if isinstance(payload, str):
            msg_payload = payload
        else:
            # keep the payload as a python object for easier assertions in tests
            msg_payload = payload
        self.published.append(IotMessage(topic=topic, payload=msg_payload))

    # backward compatible alias used by some tests
    def publish(self, msg: IotMessage) -> None:
        self.published.append(msg)

    def simulate_incoming(self, msg: IotMessage) -> None:
        """Invoke the registered incoming-message callback with msg.

        Tests can call this to emulate an MQTT message arriving from the broker.
        If no callback is registered the call is a no-op.
        """
        if self._callback is None:
            return

        # only invoke the callback if the message topic matches at least one
        # subscription. This mirrors how a broker would route messages.
        for sub in self.subscriptions:
            if self._topic_matches_subscription(msg.topic, sub):
                self._callback(msg)
                return

    def register_callback(self, cb: Callable[[IotMessage], None]) -> None:
        if cb not in self._callbacks:
            self._callbacks.append(cb)

    def unregister_callback(self, cb: Callable[[IotMessage], None]) -> None:
        if cb in self._callbacks:
            self._callbacks.remove(cb)

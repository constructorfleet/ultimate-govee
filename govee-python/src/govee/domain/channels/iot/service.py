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

    def __init__(self, incoming_queue_max: int = 3) -> None:
        self.published: List[IotMessage] = []
        self.subscriptions: List[str] = []
        # retained messages storage: topic -> IotMessage
        self._retained: dict[str, IotMessage] = {}
        # incoming message queue used while disconnected: list of IotMessage
        # bounded queue with default max size to avoid unbounded memory use.
        self._incoming_queue: List[IotMessage] = []
        self._incoming_queue_max: int = incoming_queue_max
        # counter for how many messages have been dropped due to queue eviction
        self._dropped_count: int = 0
        self.connected: bool = False
        # interruption flag: when True, incoming messages are queued even if
        # callbacks are registered (simulates transient network interruption)
        self._interrupted: bool = False
        # store the last iot_data passed to connect for higher-level tests
        self.iot_data: Optional[object] = None
        # support multiple callbacks
        self._callbacks: List[Callable[[IotMessage], None]] = []
        # public metric for queue length
        self._queued_count: int = 0

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
            # if there are queued incoming messages deliver them now to the
            # newly registered callback (and any other callbacks). We deliver
            # messages in FIFO order and then clear the queue.
            if self._incoming_queue:
                for queued in list(self._incoming_queue):
                    # only deliver queued messages that match subscriptions
                    for sub in self.subscriptions:
                        if self._topic_matches_subscription(queued.topic, sub):
                            for cb in list(self._callbacks):
                                cb(queued)
                            break
                self._incoming_queue.clear()

    def disconnect(self) -> None:
        """Simulate disconnecting from the broker."""
        self.connected = False
        self._callbacks = []
        # clear stored iot_data on disconnect
        self.iot_data = None

    def subscribe(self, topic: str) -> None:
        if topic not in self.subscriptions:
            self.subscriptions.append(topic)
            # deliver any retained messages that match the subscription
            for t, retained_msg in list(self._retained.items()):
                if self._topic_matches_subscription(t, topic):
                    # route retained message to callbacks
                    for cb in list(self._callbacks):
                        cb(retained_msg)

    def _topic_matches_subscription(self, topic: str, subscription: str) -> bool:
        """Topic matching helper with minimal MQTT wildcard support.

        Supported semantics:
          - exact match
          - '+' matches exactly one topic level
          - '#' matches any number of trailing levels (including zero)

        This implements the common MQTT rules sufficient for unit tests.
        """
        # handle full wildcard '#'
        if subscription == '#':
            return True

        topic_levels = topic.split('/')
        sub_levels = subscription.split('/')

        i = 0
        while i < len(sub_levels):
            s = sub_levels[i]
            # if '#' is encountered it matches any remaining levels
            if s == '#':
                return True
            if i >= len(topic_levels):
                return False
            t = topic_levels[i]
            if s == '+':
                # matches exactly one level
                pass
            elif s != t:
                return False
            i += 1

        # all subscription levels consumed; topic must not have extra levels
        return i == len(topic_levels)

    def send(self, topic: str, payload: object, retained: bool = False, qos: Optional[int] = None) -> IotMessage:
        """Record a published message.

        The payload in the TS implementation is a JSON string. To keep tests
        flexible we accept either a dict/object or a pre-serialized string.
        """
        if isinstance(payload, str):
            msg_payload = payload
        else:
            # keep the payload as a python object for easier assertions in tests
            msg_payload = payload
        # If retained is True and payload is None, MQTT semantics say to clear
        # any retained message for the topic.
        if retained and msg_payload is None:
            if topic in self._retained:
                del self._retained[topic]
            # still record the publish for tests, but do not create a retained entry
            msg = IotMessage(topic=topic, payload=msg_payload, retained=True)
            self.published.append(msg)
            return msg

        import time

        msg = IotMessage(topic=topic, payload=msg_payload, retained=retained)
        # attach metadata
        import time
        msg.qos = qos
        msg.timestamp = time.time()
        # ack flag initial state for qos 1
        msg.acked = False
        self.published.append(msg)
        if retained:
            # store a copy of the retained message
            self._retained[topic] = msg
        return msg

    # backward compatible alias used by some tests
    def publish(self, msg: IotMessage) -> None:
        self.published.append(msg)

    def simulate_incoming(self, msg: IotMessage) -> None:
        """Invoke the registered incoming-message callback with msg.

        Tests can call this to emulate an MQTT message arriving from the broker.
        If no callback is registered the call is a no-op.
        """
        # if there are no callbacks registered we are disconnected from any
        # listeners; queue messages that match subscriptions so they can be
        # delivered when a callback registers again.
        # if interrupted or there are no callbacks registered, queue messages
        # that match subscriptions so they can be delivered when resumed or a
        # callback registers again.
        if self._interrupted or not self._callbacks:
            # if message topic matches any subscription, queue it (bounded)
            for sub in self.subscriptions:
                if self._topic_matches_subscription(msg.topic, sub):
                    # enforce max size: evict oldest if needed
                    if len(self._incoming_queue) >= self._incoming_queue_max:
                        # drop oldest
                        dropped = self._incoming_queue.pop(0)
                        self._dropped_count += 1
                        # invoke any registered drop callbacks
                        if hasattr(self, '_drop_callbacks'):
                            for cb in list(self._drop_callbacks):
                                try:
                                    cb(dropped)
                                except Exception:
                                    pass
                        # log the drop for observability
                        try:
                            import logging

                            logging.getLogger(__name__).warning(
                                "Dropped incoming message for topic %s", dropped.topic
                            )
                        except Exception:
                            pass
                    else:
                        self._queued_count += 1
                    self._incoming_queue.append(msg)
                    return
            return

        # only invoke callbacks if the message topic matches at least one
        # subscription. This mirrors how a broker would route messages.
        for sub in self.subscriptions:
            if self._topic_matches_subscription(msg.topic, sub):
                for cb in list(self._callbacks):
                    cb(msg)
                return

    def register_callback(self, cb: Callable[[IotMessage], None]) -> None:
        if cb not in self._callbacks:
            self._callbacks.append(cb)

    def unregister_callback(self, cb: Callable[[IotMessage], None]) -> None:
        if cb in self._callbacks:
            self._callbacks.remove(cb)

    def unsubscribe(self, topic: str) -> None:
        """Remove a subscription if present."""
        if topic in self.subscriptions:
            self.subscriptions.remove(topic)

    @property
    def dropped_count(self) -> int:
        """Number of messages dropped from the incoming queue due to eviction."""
        return self._dropped_count

    def reset_dropped_count(self) -> None:
        """Reset the dropped-message counter to zero."""
        self._dropped_count = 0


        # mark as interrupted; simulate temporary network interruption
        self._interrupted = False

    def interrupt(self) -> None:
        """Simulate an interruption where incoming messages are queued even
        if callbacks are registered. Useful for testing network blips."""
        self._interrupted = True

    def resume(self) -> None:
        """Resume normal processing and deliver any queued messages."""
        self._interrupted = False
        # deliver queued messages
        if self._incoming_queue:
            for queued in list(self._incoming_queue):
                for sub in self.subscriptions:
                    if self._topic_matches_subscription(queued.topic, sub):
                        for cb in list(self._callbacks):
                            cb(queued)
                        break
            self._incoming_queue.clear()

    @property
    def queued_count(self) -> int:
        """Number of messages currently queued for delivery."""
        return len(self._incoming_queue)

    def register_drop_callback(self, cb: Callable[[IotMessage], None]) -> None:
        """Register a callback invoked when messages are dropped due to queue eviction."""
        if not hasattr(self, '_drop_callbacks'):
            self._drop_callbacks = []
        if cb not in self._drop_callbacks:
            self._drop_callbacks.append(cb)

    def unregister_drop_callback(self, cb: Callable[[IotMessage], None]) -> None:
        if hasattr(self, '_drop_callbacks') and cb in self._drop_callbacks:
            self._drop_callbacks.remove(cb)

    def acknowledge(self, msg: IotMessage) -> None:
        """Simulate acknowledging a message (QoS 1 semantics in tests)."""
        msg.acked = True

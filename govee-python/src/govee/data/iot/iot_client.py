"""Async in-memory IoT client used by tests.

This is a lightweight asyncio-based implementation inspired by the
TypeScript lib/data/iot client. It supports connect/disconnect,
subscribe, publish (with retained and qos=1 inflight tracking),
callbacks and simple retry/ack semantics used by the test-suite.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable, Dict, List, Optional, Protocol, TypedDict, runtime_checkable


class AsyncIotMessage:
    def __init__(
        self,
        topic: str,
        payload: Any,
        qos: int = 0,
        retained: bool = False,
        max_retries: int = 3,
    ) -> None:
        self.topic = topic
        self.payload = payload
        self.qos = qos
        self.retained = retained
        self.timestamp = time.time()
        self.acked: bool = False
        # retry bookkeeping
        self.send_attempts: int = 0
        self.max_retries: int = max_retries
        self.backoff_intervals: List[float] = []


class IoTHandler(Protocol):
    """Protocol for handler objects passed to IoTClient.create().

    Methods are optional; if present they may be sync or async callables.
    """

    def onMessage(self, topic: str, payload: Any, dup: bool, qos: int, retain: bool) -> Any:  # pragma: no cover - interface
        ...

    def onError(self, data: Any) -> Any:  # pragma: no cover - interface
        ...

    def onConnectionSuccess(self, data: Any) -> Any:  # pragma: no cover - interface
        ...

    def onConnectionFailure(self, data: Any) -> Any:  # pragma: no cover - interface
        ...


class IoTData(TypedDict):
    certificate: str
    privateKey: str
    endpoint: str
    accountId: str
    clientId: str
    topic: str


class IoTClient:
    """Richer asyncio in-memory MQTT-like client mirroring TS client shape.

    Supports two usage patterns:
      - low-level handler object similar to the TypeScript client where a
        handler with onMessage/onError/etc. can be passed to create().
      - simple async callback registration via register_callback(cb).

    The class exposes create(iot_data, handler) to more closely mirror the
    TypeScript API used by higher-level code.
    """

    def __init__(self) -> None:
        self.published: List[AsyncIotMessage] = []
        self.subscriptions: List[str] = []
        self._retained: Dict[str, AsyncIotMessage] = {}
        self._callbacks: List[Callable[..., Awaitable[None]]] = []
        self._inflight: List[AsyncIotMessage] = []
        self.connected = False
        # optional IoT connection info passed to create
        self.iot_data: Optional[IoTData] = None
        # optional handler object (with methods like onMessage)
        self._handler: Optional[IoTHandler] = None
        # incoming message queue for while disconnected or interrupted
        self._incoming_queue: List[AsyncIotMessage] = []
        self._incoming_queue_max: int = 3
        self._dropped_count: int = 0
        # interruption flag: when True incoming messages are queued even if callbacks exist
        self._interrupted: bool = False
        # drop callbacks invoked when messages are dropped from queue or inflight
        self._drop_callbacks: List[Callable[[AsyncIotMessage], None]] = []
        # scheduled retries: list of tuples (msg, remaining_intervals)
        self._scheduled_retries: List[tuple[AsyncIotMessage, List[float]]] = []

    async def create(self, iot_data: IoTData, handler: Optional[IoTHandler] = None) -> "IoTClient":
        """Initialize client with connection details and a handler object.

        The handler is expected to provide onMessage(topic, payload, dup, qos, retain)
        and may provide onConnectionSuccess/onConnectionFailure/onError methods.
        """
        # store connection info and handler
        self.iot_data = iot_data
        self._handler = handler

        # ensure topic from iot_data is tracked
        topic = iot_data.get("topic")
        if topic and topic not in self.subscriptions:
            self.subscriptions.append(topic)

        # simulate connection flow
        await self.connect()
        # notify handler of connection success
        if hasattr(handler, "onConnectionSuccess"):
            try:
                handler.onConnectionSuccess({"session_present": False})
            except Exception:
                # ignore handler exceptions
                pass
        return self

    async def connect(self) -> None:
        self.connected = True
        # when connecting subscribe to current subscriptions and deliver retained
        for topic in list(self.subscriptions):
            # deliver retained messages to handler and callbacks
            retained_msg = self._retained.get(topic)
            if retained_msg:
                await self._deliver_message(topic, retained_msg.payload, retained=True)

    async def disconnect(self) -> None:
        # simulate graceful disconnect
        self.connected = False
        # clear handler registration
        self._handler = None

    async def subscribe(self, topic: str) -> None:
        if topic not in self.subscriptions:
            self.subscriptions.append(topic)
        # deliver retained messages that match the subscription
        for t, msg in list(self._retained.items()):
            if self._topic_matches_subscription(t, topic):
                await self._deliver_message(t, msg.payload, retained=True)

    async def unsubscribe(self, topic: Optional[str] = None) -> None:
        if topic is None:
            self.subscriptions.clear()
        else:
            try:
                self.subscriptions.remove(topic)
            except ValueError:
                pass

    def register_callback(self, cb: Callable[..., Awaitable[None]]) -> None:
        if cb not in self._callbacks:
            self._callbacks.append(cb)

    def unregister_callback(self, cb: Callable[..., Awaitable[None]]) -> None:
        if cb in self._callbacks:
            self._callbacks.remove(cb)

    async def publish(
        self,
        topic: str,
        payload: Any,
        qos: int = 0,
        retained: bool = False,
        max_retries: int = 3,
    ) -> AsyncIotMessage:
        """Publish a message and deliver it to subscribers/handler.

        Returns the internal AsyncIotMessage instance for qos/ack testing.
        """
        msg = AsyncIotMessage(topic=topic, payload=payload, qos=qos, retained=retained, max_retries=max_retries)
        msg.send_attempts = 1
        self.published.append(msg)

        # retained semantics
        if retained:
            if payload is None:
                if topic in self._retained:
                    del self._retained[topic]
            else:
                self._retained[topic] = msg

        if qos and qos > 0:
            if msg not in self._inflight:
                self._inflight.append(msg)

        # if there's a handler present, deliver via handler.onMessage
        await self._deliver_message(topic, payload, retained=retained)
        return msg

    async def _deliver_message(self, topic: str, payload: Any, retained: bool = False) -> None:
        # deliver to handler first
        if self._handler and hasattr(self._handler, "onMessage"):
            try:
                # follow TS signature: onMessage(topic, payload, dup, qos, retain)
                self._handler.onMessage(topic, payload, False, 1, retained)
            except Exception:
                # handler error should call onError if provided
                if self._handler and hasattr(self._handler, "onError"):
                    try:
                        self._handler.onError({"error": "handler_exception"})
                    except Exception:
                        pass

        # deliver to registered async callbacks
        for cb in list(self._callbacks):
            try:
                asyncio.create_task(cb(topic, payload, retained))
            except Exception:
                # ignore callback failures
                pass

    def acknowledge(self, msg: AsyncIotMessage) -> None:
        msg.acked = True
        if msg in self._inflight:
            try:
                self._inflight.remove(msg)
            except ValueError:
                pass

    async def retry_inflight(self) -> None:
        for msg in list(self._inflight):
            if getattr(msg, "acked", False):
                if msg in self._inflight:
                    self._inflight.remove(msg)
                continue
            msg.send_attempts = getattr(msg, "send_attempts", 0) + 1
            if msg.send_attempts > getattr(msg, "max_retries", 3):
                # drop and optionally inform handler via onError/drop callback
                try:
                    self._inflight.remove(msg)
                except ValueError:
                    pass

    @property
    def inflight_count(self) -> int:
        return len(self._inflight)

    def _topic_matches_subscription(self, topic: str, subscription: str) -> bool:
        if subscription == '#':
            return True
        t_levels = topic.split('/')
        s_levels = subscription.split('/')
        i = 0
        while i < len(s_levels):
            s = s_levels[i]
            if s == '#':
                return True
            if i >= len(t_levels):
                return False
            if s == '+':
                pass
            elif s != t_levels[i]:
                return False
            i += 1
        return i == len(t_levels)


    def simulate_incoming(self, msg: AsyncIotMessage) -> None:
        """Simulate an incoming message from the broker.

        If connected and not interrupted deliver immediately; otherwise queue
        the message (bounded by _incoming_queue_max) and call drop callbacks
        when messages are evicted.
        """
        # only consider subscribing topics
        matched = any(self._topic_matches_subscription(msg.topic, s) for s in self.subscriptions)
        if not matched:
            return

        if self.connected and not self._interrupted and self._callbacks:
            # deliver immediately to handler/callbacks
            asyncio.create_task(self._deliver_message(msg.topic, msg.payload, retained=getattr(msg, 'retained', False)))
            # also handle possible ack semantics
            self._process_auto_ack(msg.payload)
            return

        # otherwise queue the message
        self._incoming_queue.append(msg)
        # trim if over max
        while len(self._incoming_queue) > self._incoming_queue_max:
            dropped = self._incoming_queue.pop(0)
            self._dropped_count += 1
            for cb in list(self._drop_callbacks):
                try:
                    cb(dropped)
                except Exception:
                    pass

    async def send_with_retry(
        self,
        topic: str,
        payload: Any,
        qos: int = 0,
        max_retries: int = 3,
        retained: bool = False,
        backoff_intervals: Optional[list] = None,
    ) -> AsyncIotMessage:
        """Async publish that optionally schedules background retries using backoff_intervals.

        This method returns immediately with the published message object; retries
        are handled by background tasks which will attempt resend after each
        backoff interval. Background retry tasks are cancelled on disconnect.
        """
        msg = await self.publish(topic, payload, qos=qos, retained=retained, max_retries=max_retries)
        msg.send_attempts = 1
        msg.max_retries = max_retries
        if backoff_intervals:
            msg.backoff_intervals = list(backoff_intervals)
            # schedule a background retry task
            task = asyncio.create_task(self._schedule_retries(msg, list(msg.backoff_intervals)))
            if not hasattr(self, '_retry_tasks'):
                self._retry_tasks: List[asyncio.Task] = []
            self._retry_tasks.append(task)
        return msg

    def _process_auto_ack(self, payload: Any) -> None:
        """If payload is an ack for an inflight message, acknowledge it.

        Convention: payload may contain {'ack_for': matching_payload} to
        indicate acknowledgement.
        """
        if isinstance(payload, dict) and 'ack_for' in payload:
            ack_for = payload['ack_for']
            # find first inflight message whose payload matches
            for msg in list(self._inflight):
                if msg.payload == ack_for:
                    self.acknowledge(msg)
                    break

    async def retry_inflight(self) -> None:
        # process scheduled retries first
        if hasattr(self, '_scheduled_retries') and self._scheduled_retries:
            # decrease intervals and trigger retry attempts
            new_sched = []
            for msg, intervals in list(self._scheduled_retries):
                if intervals:
                    intervals.pop(0)
                # perform an attempt now
                msg.send_attempts = getattr(msg, 'send_attempts', 0) + 1
                if msg.send_attempts > getattr(msg, 'max_retries', 3):
                    # drop
                    if msg in self._inflight:
                        try:
                            self._inflight.remove(msg)
                        except ValueError:
                            pass
                    for cb in list(self._drop_callbacks):
                        try:
                            cb(msg)
                        except Exception:
                            pass
                else:
                    if intervals:
                        new_sched.append((msg, intervals))
            self._scheduled_retries = new_sched

        # regular retry pass for messages without scheduling
        for msg in list(self._inflight):
            if getattr(msg, "acked", False):
                if msg in self._inflight:
                    self._inflight.remove(msg)
                continue
            # if message is scheduled then skip here
            if any(smsg is msg for smsg, _ in getattr(self, '_scheduled_retries', [])):
                continue
            msg.send_attempts = getattr(msg, "send_attempts", 0) + 1
            if msg.send_attempts > getattr(msg, "max_retries", 3):
                if msg in self._inflight:
                    try:
                        self._inflight.remove(msg)
                    except ValueError:
                        pass
                for cb in list(self._drop_callbacks):
                    try:
                        cb(msg)
                    except Exception:
                        pass

    # --- incoming queue/metrics helpers ---
    @property
    def queued_count(self) -> int:
        return len(self._incoming_queue)

    @property
    def dropped_count(self) -> int:
        return self._dropped_count

    def reset_dropped_count(self) -> None:
        self._dropped_count = 0

    def register_drop_callback(self, cb: Callable[[AsyncIotMessage], None]) -> None:
        if cb not in self._drop_callbacks:
            self._drop_callbacks.append(cb)

    def set_incoming_queue_max(self, new_max: int) -> None:
        self._incoming_queue_max = new_max
        while len(self._incoming_queue) > self._incoming_queue_max:
            dropped = self._incoming_queue.pop(0)
            self._dropped_count += 1
            for cb in list(self._drop_callbacks):
                try:
                    cb(dropped)
                except Exception:
                    pass

    def purge_queue(self) -> None:
        while self._incoming_queue:
            dropped = self._incoming_queue.pop(0)
            self._dropped_count += 1
            for cb in list(self._drop_callbacks):
                try:
                    cb(dropped)
                except Exception:
                    pass

    def interrupt(self) -> None:
        self._interrupted = True

    def resume(self) -> None:
        self._interrupted = False
        # deliver queued messages now
        if self.connected:
            for queued in list(self._incoming_queue):
                for sub in self.subscriptions:
                    if self._topic_matches_subscription(queued.topic, sub):
                        asyncio.create_task(self._deliver_message(queued.topic, queued.payload, getattr(queued, 'retained', False)))
                        break
            self._incoming_queue.clear()

    def run_scheduled_retries(self, steps: int = 1) -> None:
        raise RuntimeError("run_scheduled_retries is no longer synchronous; use await retry_inflight() or rely on background retry tasks")

    def metrics(self) -> dict:
        return {
            "queued_count": self.queued_count,
            "dropped_count": self.dropped_count,
            "inflight_count": self.inflight_count,
        }

    def metrics_text(self) -> str:
        m = self.metrics()
        lines = [
            f"govee_iot_queued_count {m['queued_count']}",
            f"govee_iot_dropped_count {m['dropped_count']}",
            f"govee_iot_inflight_count {m['inflight_count']}",
        ]
        return "\n".join(lines) + "\n"

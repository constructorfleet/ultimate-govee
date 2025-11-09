"""Async in-memory IoT client used by tests.

This is a lightweight asyncio-based implementation inspired by the
TypeScript lib/data/iot client. It supports connect/disconnect,
subscribe, publish (with retained and qos=1 inflight tracking),
callbacks and simple retry/ack semantics used by the test-suite.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable, Dict, List, Optional


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


class AsyncIotClient:
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
        self.iot_data: Optional[dict] = None
        # optional handler object (with methods like onMessage)
        self._handler: Optional[object] = None

    async def create(self, iot_data: dict, handler: object) -> "AsyncIotClient":
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

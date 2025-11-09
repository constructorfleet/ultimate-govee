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
    """Simple asyncio-based in-memory MQTT-like client for tests.

    Callbacks are async callables with signature
      async def cb(topic, payload, retained=False)
    """

    def __init__(self) -> None:
        self.published: List[AsyncIotMessage] = []
        self.subscriptions: List[str] = []
        self._retained: Dict[str, AsyncIotMessage] = {}
        self._callbacks: List[Callable[..., Awaitable[None]]] = []
        self._inflight: List[AsyncIotMessage] = []
        self.connected = False

    async def connect(self) -> None:
        self.connected = True

    async def disconnect(self) -> None:
        self.connected = False
        self._callbacks.clear()

    async def subscribe(self, topic: str) -> None:
        if topic not in self.subscriptions:
            self.subscriptions.append(topic)
        # deliver retained messages that match the subscription
        for t, msg in list(self._retained.items()):
            if self._topic_matches_subscription(t, topic):
                for cb in list(self._callbacks):
                    # schedule but don't await
                    asyncio.create_task(cb(t, msg.payload, True))

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
        # create message object
        msg = AsyncIotMessage(topic=topic, payload=payload, qos=qos, retained=retained, max_retries=max_retries)
        msg.send_attempts = 1
        self.published.append(msg)

        # handle retained semantics
        if retained:
            if payload is None:
                # clear retained
                if topic in self._retained:
                    del self._retained[topic]
            else:
                self._retained[topic] = msg

        # track inflight for qos>0
        if qos and qos > 0:
            if msg not in self._inflight:
                self._inflight.append(msg)

        # deliver to callbacks if subscribed
        for sub in self.subscriptions:
            if self._topic_matches_subscription(topic, sub):
                for cb in list(self._callbacks):
                    # deliver asynchronously
                    asyncio.create_task(cb(topic, payload, retained))
                break

        return msg

    def acknowledge(self, msg: AsyncIotMessage) -> None:
        msg.acked = True
        # remove from inflight if present
        if msg in self._inflight:
            try:
                self._inflight.remove(msg)
            except ValueError:
                pass

    async def retry_inflight(self) -> None:
        # copy list to avoid mutation during iteration
        for msg in list(self._inflight):
            if getattr(msg, 'acked', False):
                # already acked, ensure removed
                if msg in self._inflight:
                    self._inflight.remove(msg)
                continue
            msg.send_attempts = getattr(msg, 'send_attempts', 0) + 1
            if msg.send_attempts > getattr(msg, 'max_retries', 3):
                # drop
                try:
                    self._inflight.remove(msg)
                except ValueError:
                    pass

    @property
    def inflight_count(self) -> int:
        return len(self._inflight)

    def _topic_matches_subscription(self, topic: str, subscription: str) -> bool:
        # simple MQTT matching: exact, + one level, # multi-level
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


# expose a friendly import name used by tests
__all__ = ["AsyncIotClient", "AsyncIotMessage"]

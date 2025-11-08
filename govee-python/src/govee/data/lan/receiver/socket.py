"""Asyncio UDP socket wrapper for receiver tests.

This is a minimal wrapper used by unit tests to ensure the receiver service
can create and bind a socket and parse incoming messages. We avoid real
network IO in tests by exposing a "feed" method that simulates receiving data.
"""
from __future__ import annotations

import asyncio
from typing import Callable


class DummySocket:
    def __init__(self) -> None:
        self._on_message: Callable[[bytes, tuple], None] | None = None

    def on_message(self, fn: Callable[[bytes, tuple], None]) -> None:
        self._on_message = fn

    async def bind(self, host: str, port: int) -> None:
        # simulate async bind
        await asyncio.sleep(0)

    def feed(self, data: bytes, remote: tuple) -> None:
        if self._on_message:
            self._on_message(data, remote)


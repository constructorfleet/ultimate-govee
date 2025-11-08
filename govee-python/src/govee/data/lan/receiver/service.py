"""Receiver service that uses the dummy socket to parse messages.

This minimal service binds the socket and exposes a simple callback-based
message handler which converts raw bytes to MessageEvent objects used in
tests.
"""
from __future__ import annotations

from typing import Callable

from .types import MessageEvent
from .socket import DummySocket


class ReceiverService:
    def __init__(self, socket: DummySocket | None = None) -> None:
        self._socket = socket or DummySocket()
        self._on_message: Callable[[MessageEvent], None] | None = None

    async def start(self, host: str, port: int) -> None:
        await self._socket.bind(host, port)
        self._socket.on_message(self._handle_raw)

    def _handle_raw(self, data: bytes, remote: tuple) -> None:
        ev = MessageEvent(message=data, remote_info=remote)
        if self._on_message:
            self._on_message(ev)

    def on_message(self, fn: Callable[[MessageEvent], None]) -> None:
        self._on_message = fn


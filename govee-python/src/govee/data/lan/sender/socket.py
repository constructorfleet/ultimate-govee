"""Minimal LAN sender socket wrapper used in tests.

Provides a DummySocket for test simulation and a SenderSocket class with a
send() coroutine that delegates to the underlying socket. The implementation
is intentionally small and synchronous-friendly for unit tests.
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional

from govee.common.observables import ForwardBehaviorSubject

from .types import SenderState


class DummySocket:
    def __init__(self) -> None:
        self.sent = []

    def send(self, data: bytes, port: int, address: str, cb=None):
        # emulate Node's dgram socket send: invoke callback with (err?)
        self.sent.append((data, port, address))
        if cb:
            cb(None)

    async def bind(self, host: str = "0.0.0.0", port: int = 0) -> None:
        await asyncio.sleep(0)


class SenderSocket:
    def __init__(
        self, config: Optional[Dict[str, Any]] = None, socket: Optional[Any] = None
    ) -> None:
        self.config = config or {}
        self.socket = socket or DummySocket()
        self.socket_state = ForwardBehaviorSubject(SenderState.UNBOUND)

    async def send(self, msg: bytes, port: int, address: str | None = None) -> None:
        # wrap the callback-style send into an awaitable
        loop = asyncio.get_event_loop()
        fut = loop.create_future()

        def _cb(err=None):
            if err:
                fut.set_exception(RuntimeError(str(err)))
            else:
                fut.set_result(None)

        # call underlying send
        try:
            self.socket.send(msg, port, address, _cb)
        except TypeError:
            # maybe the underlying API doesn't accept a callback; just call
            # and mark success
            try:
                self.socket.send(msg, port, address)
                fut.set_result(None)
            except Exception as e:
                fut.set_exception(e)

        return await fut

    async def bind(self) -> None:
        self.socket_state.next(SenderState.BINDING)
        if hasattr(self.socket, "bind"):
            fn = getattr(self.socket, "bind")
            if asyncio.iscoroutinefunction(fn):
                await fn(
                    self.config.get("bindAddress", "0.0.0.0"),
                    self.config.get("senderPort", 0),
                )
            else:
                try:
                    fn(
                        self.config.get("bindAddress", "0.0.0.0"),
                        self.config.get("senderPort", 0),
                    )
                except TypeError:
                    pass

        self.socket_state.next(SenderState.BOUND)

    def close(self) -> None:
        self.socket_state.next(SenderState.CLOSED)

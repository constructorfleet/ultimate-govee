"""Asyncio UDP socket wrapper for receiver tests.

This is a minimal wrapper used by unit tests to ensure the receiver service
can create and bind a socket and parse incoming messages. We avoid real
network IO in tests by exposing a "feed" method that simulates receiving data.
"""

from __future__ import annotations

import asyncio
from typing import Any, Callable, Dict, Optional

from govee.common.observables import ForwardBehaviorSubject, Subject

from .types import MessageEvent, ReceiverState


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


class ReceiverSocket:
    """Minimal ReceiverSocket compatible with the TypeScript implementation.

    It exposes a socket_state Behavior-like subject and a message_bus subject
    that publishes MessageEvent objects when the underlying socket receives
    data. The bind() method is async and will await the underlying socket's
    bind() coroutine.
    """

    def __init__(
        self, config: Optional[Dict[str, Any]] = None, socket: Optional[Any] = None
    ) -> None:
        self.config = config or {}
        self.socket = socket or DummySocket()
        # Behavior-like subject holding the current ReceiverState
        self.socket_state = ForwardBehaviorSubject(ReceiverState.UNBOUND)
        # Subject that publishes MessageEvent instances
        self.message_bus = Subject()

        # wire underlying socket message callback to our bus
        def _on_message(msg: bytes, remote: tuple) -> None:
            self.message_bus.next(MessageEvent(message=msg, remote_info=remote))

        # prefer a named registration API if available
        if hasattr(self.socket, "on_message"):
            try:
                self.socket.on_message(_on_message)
            except Exception:
                # some test doubles may expect a different API; fall back
                # to setting the attribute directly
                setattr(self.socket, "_on_message", _on_message)
        else:
            # fallback: allow tests to set _on_message attr
            setattr(self.socket, "_on_message", _on_message)

    @property
    def address(self) -> Optional[Any]:
        # mirror Node's dgram Socket.address() behavior when present
        if hasattr(self.socket, "address"):
            fn = getattr(self.socket, "address")
            try:
                return fn()
            except Exception:
                return None
        # some socket implementations expose an `addr` or `address` attr
        for attr in ("addr", "_address", "address_info"):
            if hasattr(self.socket, attr):
                return getattr(self.socket, attr)
        return None

    async def bind(self) -> None:
        # indicate we're binding
        self.socket_state.next(ReceiverState.BINDING)
        # call underlying bind if it's async
        bind_coro = None
        if hasattr(self.socket, "bind"):
            fn = getattr(self.socket, "bind")
            if asyncio.iscoroutinefunction(fn):
                bind_coro = fn(
                    self.config.get("bindAddress", "0.0.0.0"),
                    self.config.get("receiverPort", 38899),
                )
            else:
                # support sync bind
                try:
                    fn(
                        self.config.get("bindAddress", "0.0.0.0"),
                        self.config.get("receiverPort", 38899),
                    )
                except TypeError:
                    # maybe different signature; ignore for tests
                    pass

        if bind_coro is not None:
            await bind_coro

        # replicate Node.Dgram addMembership behavior when available. Tests
        # that use a real socket may expect addMembership(broadcast, iface).
        if hasattr(self.socket, "addMembership"):
            try:
                self.socket.addMembership(
                    self.config.get("broadcastAddress"), self.config.get("bindAddress")
                )
            except Exception:
                # ignore if the test double does not support addMembership
                pass

        # mark as listening
        self.socket_state.next(ReceiverState.LISTENING)

    def close(self) -> None:
        self.socket_state.next(ReceiverState.CLOSED)

    # compatibility alias
    def on_module_destroy(self) -> None:
        self.close()

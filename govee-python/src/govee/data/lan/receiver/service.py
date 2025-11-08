"""Receiver service implementing basic bind and message handling.

This mirrors the TypeScript ReceiverService: bind() waits until the
underlying socket transitions to LISTENING (or ERROR). on_message
attempts to parse JSON payloads and handle known commands.
"""
from __future__ import annotations

from typing import Any, Optional
import json
import logging


class ReceiverService:
    """Receiver service implementing basic bind and message handling.

    This mirrors the TypeScript ReceiverService: bind() waits until the
    underlying socket transitions to LISTENING (or ERROR). on_message
    attempts to parse JSON payloads and handle known commands.
    """

    def __init__(self, socket: Optional[Any] = None, config: Optional[Any] = None) -> None:
        self.socket = socket
        self.config = config
        self.running = False
        self.logger = logging.getLogger(self.__class__.__name__)

    async def bind(self) -> bool:
        """Bind the receiver socket and wait until it's listening.

        The method subscribes to the socket.socket_state (if present) and
        resolves when the state becomes LISTENING. If the socket reports
        ERROR the coroutine raises an exception.
        """
        # defensive: if there is no socket or no socket_state, just try to
        # call bind and assume success.
        if not self.socket or not hasattr(self.socket, "socket_state"):
            if hasattr(self.socket, "bind"):
                maybe = self.socket.bind()
                # if bind returned a coroutine, await it
                if hasattr(maybe, "__await__"):
                    await maybe
            return True

        # listen for state changes
        fut = None

        from asyncio import get_event_loop, Future

        loop = get_event_loop()
        fut = loop.create_future()

        def _on_state(state: Any) -> None:
            # import here to avoid circular imports in tests
            from govee.data.lan.receiver.types import ReceiverState

            self.logger.info("Receiver socket: %s", state)
            if state == ReceiverState.LISTENING:
                if not fut.done():
                    fut.set_result(True)
            elif state == ReceiverState.ERROR:
                if not fut.done():
                    fut.set_exception(RuntimeError("Error binding to receiver socket."))

        unsub = self.socket.socket_state.subscribe(_on_state)

        # trigger bind on the socket (may be async)
        bind_ret = None
        try:
            bind_ret = self.socket.bind()
            if hasattr(bind_ret, "__await__"):
                await bind_ret
        except Exception:
            # allow the state subscription to report the error if available
            pass

        result = await fut
        try:
            unsub()
        except Exception:
            pass
        return bool(result)

    # event handlers / compatibility names
    def on_close(self) -> None:
        self.logger.info("Closed")

    def on_connect(self) -> None:
        self.logger.info("Connected")

    def on_error(self, err: Exception) -> None:
        self.logger.error("Error", exc_info=err)

    def on_listening(self) -> None:
        self.logger.debug("Listening")

    def on_message(self, msg: bytes, rinfo: Any) -> None:
        """Parse incoming UDP messages and handle known commands.

        The function mirrors the TS ReceiverService.onMessage behavior used in
        higher-level code: it attempts to JSON-decode the packet and handle
        commands like 'scan' and 'deviceStatus'. Errors are swallowed to
        preserve receiver robustness.
        """
        try:
            text = msg.decode("utf-8", errors="replace")
            message = json.loads(text)
            # try to support nested structures used in some fixtures
            # TypeScript accesses message.msg.cmd
            cmd = None
            if isinstance(message, dict):
                if "msg" in message and isinstance(message["msg"], dict):
                    cmd = message["msg"].get("cmd")
                else:
                    cmd = message.get("cmd")

            if cmd == "scan":
                self.logger.info("Device Found %s %s", rinfo, message)
            elif cmd == "deviceStatus":
                addr = getattr(rinfo, "address", None) or (rinfo[0] if isinstance(rinfo, (list, tuple)) else None)
                self.logger.info("Device status %s %s", addr, message)
        except Exception:
            # best-effort parsing: do not raise
            return

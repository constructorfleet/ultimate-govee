"""Minimal BLE client stub for tests and future expansion.

This file provides a very small BleClient that mirrors some runtime shape of
the TypeScript BleClient: it tracks enabled state, allows registering a
peripheral filter, exposes a peripheral_decoded subject, and a simple
command queue that delegates to a decoder service and records commands.

It is intentionally synchronous/imperative for easier unit testing; more
complex async/observable behavior can be added when needed.
"""
from __future__ import annotations

from typing import Callable, Optional, Any, List
from govee.common.observables import Subject, ForwardBehaviorSubject
from govee.data.ble.decoder_service import DecoderService


class BleClient:
    def __init__(self, decoder: Optional[DecoderService] = None) -> None:
        self.enabled = ForwardBehaviorSubject(False)
        self.peripheral_decoded = Subject()
        self.command_queue = Subject()
        self._canceled: set[str] = set()
        self._filter: Callable[[Any], bool] = lambda _: True
        self.decoder = decoder or DecoderService()
        self.sent: List[Any] = []

        # subscribe the command queue so published commands are handled
        self.command_queue.subscribe(lambda cmd: self._on_command(cmd))

    def set_filter(self, fn: Callable[[Any], bool]) -> None:
        self._filter = fn

    def feed_peripheral(self, peripheral: dict) -> None:
        if not self.enabled.get_value():
            return
        if not self._filter(peripheral):
            return
        # attempt decode synchronously for tests
        import asyncio

        res = asyncio.get_event_loop().run_until_complete(self.decoder.decode_device(peripheral))
        if res:
            self.peripheral_decoded.next(res)

    def send_command(self, cmd: Any) -> None:
        # in real code this would be queued and handled, tests just record
        self.sent.append(cmd)


    def _on_command(self, cmd: Any) -> None:
        command_id = cmd.get("commandId") if isinstance(cmd, dict) else None
        if command_id and command_id in self._canceled:
            return
        # forward to send_command which records
        self.send_command(cmd)

    def cancel_command(self, command_id: str) -> None:
        self._canceled.add(command_id)

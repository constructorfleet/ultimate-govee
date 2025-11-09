"""Compatibility channel object expected by tests.

Some tests import BleChannel class from the original JS repo. Provide a
minimal Python-compatible implementation that exposes the methods used by
the test-suite.
"""

from __future__ import annotations

from typing import List

from .types import BleCommand


class BleChannel:
    def __init__(self, service) -> None:
        self.service = service
        self.sent: List[BleCommand] = []

    def send_command(self, cmd: BleCommand) -> None:
        self.sent.append(cmd)
        self.service.send(cmd)

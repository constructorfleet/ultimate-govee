"""Minimal receiver.service module to satisfy imports in tests.

This module provides a tiny ReceiverService class used by tests to ensure
the package wiring is correct. It does not implement actual networking.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class ReceiverService:
    socket: Optional[Any] = None
    config: Optional[Any] = None
    running: bool = False

    def start(self) -> None:
        self.running = True

    def stop(self) -> None:
        self.running = False


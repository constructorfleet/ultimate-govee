"""Minimal receiver.service module to satisfy imports in tests.

This module provides a tiny ReceiverService class used by tests to ensure
the package wiring is correct. It does not implement actual networking.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ReceiverService:
    running: bool = False

    def start(self) -> None:
        self.running = True

    def stop(self) -> None:
        self.running = False



"""Top-level minimal service for integration-style tests."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class UltimateGoveeService:
    started: bool = False

    def start(self) -> None:
        self.started = True

    def stop(self) -> None:
        self.started = False

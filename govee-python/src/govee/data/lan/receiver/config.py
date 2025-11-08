"""Receiver configuration defaults.

Small module to hold configuration values used by the LAN receiver tests.
Keeping this minimal — real project has DI/providers; tests only need a
bind address and port for parsing behavior.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ReceiverConfig:
    host: str = "0.0.0.0"
    port: int = 9898


default_config = ReceiverConfig()


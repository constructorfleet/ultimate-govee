"""Receiver package re-exports for backward-compatible imports.

Historically the package exposed symbols from a single module
govee.data.lan.receiver. To support submodules (socket, service, types)
we provide a package __init__ that exposes the commonly-used helpers and
keeps the public API stable for tests.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

# import implementations from the package files
from .socket import ReceiverSocket, DummySocket, parse_lan_packet
from .service import ReceiverService

# keep a minimal legacy ReceiverService for compatibility if needed
__all__ = [
    "ReceiverSocket",
    "DummySocket",
    "parse_lan_packet",
    "ReceiverService",
]

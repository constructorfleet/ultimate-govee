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
from .socket import ReceiverSocket, DummySocket
from .service import ReceiverService

# The original flat module govee.data.lan.receiver implemented a
# `parse_lan_packet` helper in receiver.py. Because this package now
# shadows that module path, dynamically load the legacy module from the
# file so we can re-export the parsing helper for tests that import the
# flat symbol.
import importlib.util
import pathlib
_legacy_path = pathlib.Path(__file__).parent.parent / "receiver.py"
if _legacy_path.exists():
    spec = importlib.util.spec_from_file_location("govee.data.lan._legacy_receiver", str(_legacy_path))
    _mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(_mod)  # type: ignore
    parse_lan_packet = getattr(_mod, "parse_lan_packet")
else:
    def parse_lan_packet(_: bytes):
        raise RuntimeError("legacy receiver module not found")

__all__ = [
    "ReceiverSocket",
    "DummySocket",
    "parse_lan_packet",
    "ReceiverService",
]

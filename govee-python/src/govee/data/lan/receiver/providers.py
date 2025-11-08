"""Provider helpers for assembling receiver components in tests.

In the TypeScript project these are Nest providers. For tests we expose a
small factory to wire the config -> socket -> service so tests can easily
obtain a ready-to-use ReceiverService.
"""
from __future__ import annotations

from .config import default_config, ReceiverConfig
from .socket import DummySocket
from .service import ReceiverService


def create_receiver(config: ReceiverConfig | None = None, socket: DummySocket | None = None) -> ReceiverService:
    cfg = config or default_config
    sock = socket or DummySocket()
    svc = ReceiverService(socket=sock)
    return svc


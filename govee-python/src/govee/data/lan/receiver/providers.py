"""Provider helpers for assembling receiver components in tests.

In the TypeScript project these are Nest providers. For tests we expose a
small factory to wire the config -> socket -> service so tests can easily
obtain a ready-to-use ReceiverService.
"""

from __future__ import annotations

from .config import ReceiverConfig, default_config
from .service import ReceiverService
from .socket import DummySocket


def create_receiver(
    config: ReceiverConfig | None = None, socket: DummySocket | None = None
) -> ReceiverService:
    """Create a ReceiverService wired with a DummySocket for tests.

    The real project uses DI to assemble these pieces; tests just need a
    small factory to obtain a working service that will receive messages
    when the provided DummySocket.feed() is called.
    """
    cfg = config or default_config
    sock = socket or DummySocket()
    svc = ReceiverService(socket=sock, config=cfg)
    return svc

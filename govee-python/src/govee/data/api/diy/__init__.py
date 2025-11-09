"""DIY API helpers (minimal port of lib/data/api/diy).

Only implement the pieces required by the Python domain code: a small
service that can fetch DIY effects using the request factory used elsewhere
in the tests. Keep the implementation lightweight and test-friendly.
"""

from __future__ import annotations

from .service import GoveeDiyService

__all__ = ["GoveeDiyService"]

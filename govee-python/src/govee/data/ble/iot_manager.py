"""Minimal IoTManager fallback stub used by DecoderService for complex decoders.

In the full TypeScript implementation, IoTManager handles complex decoding
that requires additional assets or remote lookups. Here we provide a simple
class with an async `decode` method that can be monkeypatched by tests.
"""
from __future__ import annotations

from typing import Dict, Any, Optional


class IoTManager:
    async def decode(self, spec: Dict[str, Any], device_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Decode using an IoTManager-style spec.

        Default implementation is a no-op (returns None) and tests can monkeypatch
        this method to simulate complex decoding behavior.
        """
        return None


__all__ = ["IoTManager"]

"""Minimal LAN receiver parser used in tests.

The TypeScript implementation is an asyncio UDP socket wrapper that emits
decoded JSON messages. For test parity we only implement the packet parsing
utility used by higher-level services.
"""
from __future__ import annotations

import json
from typing import Any, Dict


# Minimal placeholder service to match the public surface expected by tests
class ReceiverService:
    def __init__(self) -> None:
        pass


service = ReceiverService()


def parse_lan_packet(raw: bytes) -> Dict[str, Any]:
    """Parse a Govee LAN UDP packet payload into a dict.

    Govee LAN packets are typically JSON objects. Some fields (like `data`)
    may themselves be JSON-encoded strings; we attempt to decode nested JSON
    where applicable.
    """
    text = raw.decode('utf-8', errors='replace')
    try:
        payload = json.loads(text)
    except Exception:
        # Some captured packets include leading/trailing bytes or logging
        # artifacts that make the payload not valid JSON at the outer level.
        # Attempt a best-effort extraction of the first JSON object in the
        # text by locating the first '{' and the last '}' and decoding that
        # substring.
        first = text.find('{')
        last = text.rfind('}')
        if first != -1 and last != -1 and last > first:
            try:
                payload = json.loads(text[first:last+1])
            except Exception:
                raise
        else:
            raise

    # try to parse nested JSON in `data` if present and is a string
    if 'data' in payload and isinstance(payload['data'], str):
        try:
            payload['data'] = json.loads(payload['data'])
        except Exception:
            # leave as-is if it isn't valid JSON
            pass

    return payload

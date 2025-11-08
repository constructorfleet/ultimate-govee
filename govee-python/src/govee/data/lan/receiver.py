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

    # Some captured packets include leading/trailing bytes or logging
    # artifacts that make the payload not valid JSON at the outer level.
    # Extract the first JSON object by locating the first '{' and the last
    # '}' and decode that substring. This is a best-effort approach suitable
    # for testing with persisted packet dumps.
    first = text.find('{')
    last = text.rfind('}')
    if first == -1 or last == -1 or last <= first:
        raise ValueError('no JSON object found in packet')

    payload_text = text[first:last + 1]
    payload = json.loads(payload_text)

    # try to parse nested JSON in `data` if present and is a string
    if 'data' in payload and isinstance(payload['data'], str):
        try:
            payload['data'] = json.loads(payload['data'])
        except Exception:
            # leave as-is if it isn't valid JSON
            pass

    return payload

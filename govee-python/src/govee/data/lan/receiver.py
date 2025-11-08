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
    try:
        payload = json.loads(payload_text)
    except Exception:
        # Fallback: sometimes the captured payload contains an unescaped
        # inner JSON object in the `data` field (e.g. "data":"{...}"). In
        # that case the outer JSON is invalid. Attempt to locate the inner
        # object and replace it with a JSON-encoded string so the outer JSON
        # becomes valid.
        idx = payload_text.find('"data":')
        if idx != -1:
            # find the opening quote for the data value
            qstart = payload_text.find('"', idx + len('"data":'))
            if qstart != -1 and qstart + 1 < len(payload_text) and payload_text[qstart + 1] == '{':
                # locate the matching closing brace for the inner JSON
                depth = 0
                end = -1
                for i in range(qstart + 1, len(payload_text)):
                    ch = payload_text[i]
                    if ch == '{':
                        depth += 1
                    elif ch == '}':
                        depth -= 1
                        if depth == 0:
                            end = i
                            break

                if end != -1:
                    inner = payload_text[qstart + 1:end + 1]
                    # replace the inner JSON with a JSON-encoded string
                    # replace the entire quoted value (from the opening
                    # quote at qstart through the closing quote at end+1)
                    # with a properly JSON-encoded string value.
                    fixed = payload_text[:qstart] + json.dumps(inner) + payload_text[end + 2:]
                    payload = json.loads(fixed)
                    # decode nested data if it's a string
                    if 'data' in payload and isinstance(payload['data'], str):
                        try:
                            payload['data'] = json.loads(payload['data'])
                        except Exception:
                            pass
                    return payload

        raise ValueError(f"failed to decode JSON payload: {payload_text!r}")

    # try to parse nested JSON in `data` if present and is a string
    if 'data' in payload and isinstance(payload['data'], str):
        try:
            payload['data'] = json.loads(payload['data'])
        except Exception:
            # leave as-is if it isn't valid JSON
            pass

    return payload

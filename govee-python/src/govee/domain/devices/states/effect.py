"""Effect parsing helpers for device payloads.

This module normalizes effect-related fields commonly present in API
responses or decoded payloads: 'effect', 'effectId', 'effectStr' (base64)
and 'opStr' (openapi). We normalize into a small dict used by DeviceState.
"""
from __future__ import annotations

from typing import Any, Dict, Optional
import base64


def parse_effect(payload: dict) -> Optional[Dict[str, Any]]:
    if payload is None:
        return None
    name = payload.get("effect") or payload.get("effectName")
    eid = payload.get("effectId") or payload.get("id")
    # effectStr is base64 in some endpoints; opStr used by openapi/effect API
    op_b64 = payload.get("effectStr") or payload.get("opStr")
    # validate base64-like string by attempting decode when present
    if isinstance(op_b64, str):
        try:
            # allow missing padding
            missing = len(op_b64) % 4
            if missing:
                op_b64 = op_b64 + ("=" * (4 - missing))
            _ = base64.b64decode(op_b64)
        except Exception:
            op_b64 = None

    if name is None and eid is None and op_b64 is None:
        return None
    return {"name": name, "id": eid, "op_b64": op_b64}


__all__ = ["parse_effect"]


"""Humidity state parsing.

This is a minimal port of lib/domain/devices/states/humidity.state.ts focusing
on parsing humidity from payloads for unit tests in this repository.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def parse_humidity(payload: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if payload is None:
        return None
    st = payload.get("state") if isinstance(payload, dict) else None
    if not isinstance(st, dict):
        return None
    hum = st.get("humidity")
    if hum is None:
        # handle status.code hex parsing not implemented in minimal port
        return None
    # normalize calibration and current values possibly provided as integers >100
    calibration = hum.get("calibration")
    if calibration is not None and calibration > 100:
        calibration = calibration / 100.0
    current = hum.get("current")
    if current is not None and current > 100:
        current = current / 100.0

    # derive raw when calibration present
    raw = None
    if current is not None:
        raw = current - calibration if calibration is not None else current

    minv = hum.get("min", 0)
    maxv = hum.get("max", 0)
    if current is None:
        return None
    if current < minv or current > maxv:
        return None
    return {
        "calibration": calibration,
        "range": {"min": minv, "max": maxv},
        "current": current,
        "raw": raw,
    }


__all__ = ["parse_humidity"]

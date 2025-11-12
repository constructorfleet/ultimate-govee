"""Temperature parsing helpers: current temperature, probes and calibration."""

from __future__ import annotations

from typing import Any, Dict, Optional


def parse_temperature(
    payload: Dict[str, Any],
) -> (Optional[float], Optional[int], Optional[Dict[int, float]]):
    """Extract temperature information from a device payload.

    Returns a tuple: (current_temp, calibration, temp_probes)
    - current_temp: value from 'tempc' or '_tempc' if present
    - calibration: numeric calibration value if '.cal' present
    - temp_probes: dict mapping probe index -> temp for keys like 'tempc1', 'tempc2'
    """
    if payload is None:
        return None, None, None

    cal = None
    if ".cal" in payload:
        try:
            cal = int(payload.get(".cal"))
        except Exception:
            cal = None

    cur = None
    if "tempc" in payload:
        try:
            cur = float(payload.get("tempc"))
        except Exception:
            cur = None
    elif "_tempc" in payload:
        try:
            cur = float(payload.get("_tempc"))
        except Exception:
            cur = None

    # temp probes: keys starting with 'tempc' followed by digit(s)
    probes: Dict[int, float] = {}
    for k, v in payload.items():
        if (
            isinstance(k, str)
            and k.startswith("tempc")
            and len(k) > 5
            and k[5:].isdigit()
        ):
            try:
                idx = int(k[5:])
                probes[idx] = float(v)
            except Exception:
                continue

    return cur, cal, (probes if probes else None)


__all__ = ["parse_temperature"]

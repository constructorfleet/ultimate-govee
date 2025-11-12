"""Tests for a minimal white-temperature (CT) device implementation.

These tests are RED until a WhiteTempDevice is implemented in the
implementations package.
"""

from __future__ import annotations

from typing import Any, Dict


def _sample_payload() -> Dict[str, Any]:
    return {"power": 1, "brightness": 60, "color_temp": 3500}


def test_whitetemp_apply_payload_and_get_state():
    from govee.domain.devices.implementations.whitetemp import WhiteTempDevice

    payload = _sample_payload()
    dev = WhiteTempDevice("wt-1", model="WT-100", name="White 1")
    dev.apply_payload(payload)

    st = dev.get_state()
    assert st.power is True
    assert st.brightness == 60
    assert st.color_temp == 3500


def test_whitetemp_encode_command():
    from govee.domain.devices.implementations.whitetemp import WhiteTempDevice

    dev = WhiteTempDevice("wt-2")
    frames = dev.encode_command({"power": False, "brightness": 40, "color_temp": 2700})

    assert any(f.get("op") == "power" and f.get("v") == 0 for f in frames)
    assert any(f.get("op") == "bright" and f.get("v") == 40 for f in frames)
    assert any(f.get("op") == "ct" and f.get("v") == 2700 for f in frames)

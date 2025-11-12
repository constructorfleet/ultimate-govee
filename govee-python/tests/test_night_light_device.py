"""Tests for Night Light / special mode devices.

These devices may support a 'night' flag or reduced brightness presets.
This test adds a minimal contract used by higher-level code.
"""

from govee.domain.devices.implementations.white import WhiteDevice


def test_night_mode_flag_and_encode():
    d = WhiteDevice("nl-1")
    d.apply_payload({"power": 1, "brightness": 20, "night": True})
    st = d.get_state()
    assert st.power is True
    assert st.brightness == 20

    frames = d.encode_command({"power": True, "brightness": 10})
    assert any(f.get("op") == "bright" and f.get("v") == 10 for f in frames)


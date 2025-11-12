"""Tests for Simple White (on/off + brightness) device."""

from govee.domain.devices.implementations.white import WhiteDevice


def test_white_apply_payload_and_encode():
    payload = {"power": 1, "brightness": 75}
    d = WhiteDevice("w-1")
    d.apply_payload(payload)
    st = d.get_state()
    assert st.power is True
    assert st.brightness == 75

    frames = d.encode_command({"power": False, "brightness": 40})
    assert any(f.get("op") == "power" and f.get("v") == 0 for f in frames)
    assert any(f.get("op") == "bright" and f.get("v") == 40 for f in frames)

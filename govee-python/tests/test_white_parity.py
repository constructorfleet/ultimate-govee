"""Behavioral parity tests for Simple White devices."""

from govee.domain.devices.implementations.white import WhiteDevice


def test_white_on_off_and_brightness():
    d = WhiteDevice("w-100")
    d.apply_payload({"power": True, "brightness": 80})
    st = d.get_state()
    assert st.power is True
    assert st.brightness == 80

    frames = d.encode_command({"power": False})
    assert any(f.get("op") == "power" and f.get("v") == 0 for f in frames)

    frames = d.encode_command({"brightness": 30})
    assert any(f.get("op") == "bright" and f.get("v") == 30 for f in frames)


def test_white_brightness_clamping_and_types():
    d = WhiteDevice("w-101")
    frames = d.encode_command({"brightness": 150})
    bf = next((f for f in frames if f.get("op") == "bright"), None)
    assert bf and bf.get("v") == 100

    frames = d.encode_command({"brightness": -5})
    bf = next((f for f in frames if f.get("op") == "bright"), None)
    assert bf and bf.get("v") == 0

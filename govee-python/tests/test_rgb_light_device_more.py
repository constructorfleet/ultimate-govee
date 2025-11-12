"""Additional RGB tests: hex and numeric color parsing and clamping."""

from govee.domain.devices.implementations.rgb import RGBDevice


def test_rgb_parse_hex_string_and_numeric():
    d1 = RGBDevice(id="r1")
    d1.apply_payload({"color": "#0A1438", "power": 1})
    st1 = d1.get_state()
    assert st1.color == {"r": 10, "g": 20, "b": 56}

    d2 = RGBDevice(id="r2")
    d2.apply_payload({"color": 0xFF8000, "power": 1})
    st2 = d2.get_state()
    assert st2.color == {"r": 255, "g": 128, "b": 0}


def test_rgb_brightness_clamp():
    d = RGBDevice(id="r3")
    frames = d.encode_command({"brightness": 150})
    # frames should include bright with clamped value 100
    bf = next((f for f in frames if f.get("op") == "bright"), None)
    assert bf and bf.get("v") == 100

    frames2 = d.encode_command({"brightness": -10})
    bf2 = next((f for f in frames2 if f.get("op") == "bright"), None)
    assert bf2 and bf2.get("v") == 0

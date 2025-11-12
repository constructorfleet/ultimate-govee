"""Additional RGBIC tests (segments, pixels, effects).
"""

from govee.domain.devices.implementations.rgbic import RGBICDevice


def test_rgbic_segments_payload_and_state():
    payload = {
        "power": 1,
        "brightness": 80,
        "segments": [
            {"index": 0, "length": 10, "color": {"r": 12, "g": 34, "b": 56}},
            {"index": 1, "length": 20, "color": {"r": 200, "g": 120, "b": 0}},
        ],
    }
    dev = RGBICDevice("dev-100")
    dev.apply_payload(payload)
    st = dev.get_state()
    assert st.power is True
    assert st.brightness == 80
    assert hasattr(dev, "segments")
    assert len(dev.segments) == 2
    assert dev.segments[1]["color"]["r"] == 200


def test_rgbic_pixel_array_payload_and_encode():
    payload = {"power": 1, "brightness": 100, "pixels": [[10, 20, 30], [255, 128, 0]]}
    dev = RGBICDevice("dev-101")
    dev.apply_payload(payload)
    # ensure pixels property is set
    assert hasattr(dev, "pixels")
    assert len(dev.pixels) == 2

    frames = dev.encode_command({"pixels": [[1, 2, 3], [4, 5, 6]]})
    # expect at least one frame describing pixels
    assert any(f.get("op") == "pixels" for f in frames), frames


def test_rgbic_effects_encode():
    dev = RGBICDevice("dev-102")
    frames = dev.encode_command({"effect": {"name": "rainbow", "speed": 5}})
    ef = [f for f in frames if f.get("op") == "effect"]
    assert ef and ef[0].get("name") == "rainbow" and ef[0].get("speed") == 5

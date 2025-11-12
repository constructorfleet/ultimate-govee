"""Unit tests for minimal RGBIC (addressable) device implementation.

These tests are written RED first: they will fail until a minimal
RGBICDevice implementation is provided in the implementations package.
"""

from __future__ import annotations

from typing import Any, Dict


def _sample_payload() -> Dict[str, Any]:
    return {
        "power": 1,
        "brightness": 75,
        "segments": [
            {"index": 0, "length": 10, "color": {"r": 10, "g": 20, "b": 30}},
            {"index": 1, "length": 20, "color": {"r": 255, "g": 128, "b": 0}},
        ],
    }


def test_rgbic_apply_payload_and_get_state():
    from govee.domain.devices.implementations.rgbic import RGBICDevice

    payload = _sample_payload()
    dev = RGBICDevice("dev-1", model="RGBIC-1000", name="Strip 1")
    dev.apply_payload(payload)

    st = dev.get_state()
    assert st.power is True
    assert st.brightness == 75

    # segments should be preserved on the device object
    assert hasattr(dev, "segments")
    assert isinstance(dev.segments, list)
    assert len(dev.segments) == 2
    assert dev.segments[0]["color"]["r"] == 10


def test_rgbic_encode_command():
    from govee.domain.devices.implementations.rgbic import RGBICDevice

    dev = RGBICDevice("dev-2")
    frames = dev.encode_command({
        "power": False,
        "brightness": 50,
        "segments": [{"index": 0, "color": {"r": 1, "g": 2, "b": 3}}],
    })

    # Expect frames for power and brightness
    assert any(f.get("op") == "power" and f.get("v") == 0 for f in frames)
    assert any(f.get("op") == "bright" and f.get("v") == 50 for f in frames)

    # Expect at least one segment frame with RGB values
    seg_frames = [f for f in frames if f.get("op") == "seg"]
    assert seg_frames, f"No segment frames encoded: {frames}"
    assert seg_frames[0]["r"] == 1 and seg_frames[0]["g"] == 2 and seg_frames[0]["b"] == 3


def test_rgbic_effects():
    from govee.domain.devices.implementations.rgbic import RGBICDevice

    dev = RGBICDevice("dev-3")
    frames = dev.encode_command({"effect": {"name": "rainbow", "speed": 5}})

    ef = [f for f in frames if f.get("op") == "effect"]
    assert ef and ef[0].get("name") == "rainbow" and ef[0].get("speed") == 5

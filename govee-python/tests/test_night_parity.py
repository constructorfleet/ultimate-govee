"""Behavioral parity tests for Night Light devices."""

from govee.domain.devices.implementations.night import NightDevice


def test_night_flag_and_encode():
    d = NightDevice("nl-200")
    d.apply_payload({"power": True, "brightness": 20, "night": True})
    assert d.night is True

    frames = d.encode_command({"night": True})
    nf = next((f for f in frames if f.get("op") == "night"), None)
    assert nf and nf.get("v") == 1

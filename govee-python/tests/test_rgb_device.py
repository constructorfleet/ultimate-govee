from govee.domain.devices.implementations.rgb import RGBDevice


def test_rgb_device_apply_payload_and_encode_commands():
    d = RGBDevice(id="dev-1", model="M1", name="Lamp")
    d.apply_payload({"power": True, "brightness": 45, "color": {"r": 10, "g": 20, "b": 30}})
    st = d.get_state()
    assert st.power is True
    assert st.brightness == 45
    assert st.color == {"r": 10, "g": 20, "b": 30}

    frames = d.encode_command({"power": False, "brightness": 10, "color": {"r": 1, "g": 2, "b": 3}})
    assert isinstance(frames, list)
    assert any(f.get("op") == "power" for f in frames)
    assert any(f.get("op") == "bright" for f in frames)
    assert any(f.get("op") == "rgb" for f in frames)


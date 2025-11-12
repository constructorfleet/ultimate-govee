from govee.domain.devices.implementations.rgb import RGBDevice


def test_rgb_light_encode_exact_frames():
    d = RGBDevice(id="dev-1", model="M1", name="Lamp")
    frames = d.encode_command({"power": True, "brightness": 70, "color": {"r": 255, "g": 128, "b": 0}})
    # Expect three frames in any order: power, bright, rgb
    ops = {f["op"] for f in frames}
    assert ops >= {"power", "bright", "rgb"}
    # Validate rgb values present
    rgb = next((f for f in frames if f.get("op") == "rgb"), None)
    assert rgb is not None
    assert rgb.get("r") == 255 and rgb.get("g") == 128 and rgb.get("b") == 0

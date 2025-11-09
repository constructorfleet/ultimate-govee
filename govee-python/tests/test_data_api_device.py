from govee.data.api.device import Device, DeviceState


def test_device_state_and_device_shapes():
    state = DeviceState(
        id="1234",
        on=True,
        brightness=80,
        color={"r": 255, "g": 200, "b": 100},
        raw={"id": "1234"},
    )
    dev = Device(id="1234", model="H6009", name="Living Room", state=state)

    assert dev.id == "1234"
    assert dev.model == "H6009"
    assert dev.name == "Living Room"
    assert dev.state.on is True
    assert dev.state.brightness == 80
    assert dev.state.color["g"] == 200

from govee.domain.devices.states.color_temp import ColorTempState


def test_parse_color_temp_within_range_sets_value():
    state = ColorTempState()
    data = {"state": {"colorTemperature": {"current": 3000, "min": 2000, "max": 9000}}}
    captured = []
    state.subscribe(lambda v: captured.append(v))
    state.parse_state(data)
    assert captured and captured[0]["current"] == 3000


def test_parse_color_temp_outside_range_ignored():
    state = ColorTempState()
    data = {"state": {"colorTemperature": {"current": 1000, "min": 2000, "max": 9000}}}
    captured = []
    state.subscribe(lambda v: captured.append(v))
    state.parse_state(data)
    assert captured == []


def test_set_state_emits_command_when_valid():
    state = ColorTempState()
    cmd = state.set_state({"range": {"min": 2000, "max": 9000}, "current": 3000})
    assert cmd and isinstance(cmd[0], dict)


def test_set_state_ignored_when_out_of_range():
    state = ColorTempState()
    cmd = state.set_state({"range": {"min": 2000, "max": 9000}, "current": 1000})
    assert cmd == []

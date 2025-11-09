from govee.domain.devices.states.night_light import parse_night_light, state_to_command_nightlight


def test_parse_night_light_op_and_state():
    assert parse_night_light({'op': {'command': [[1, 50]]}}) == {'on': True, 'brightness': 50}
    assert parse_night_light({'state': {'on': False, 'brightness': 10}}) == {'on': False, 'brightness': 10}


def test_state_to_command_nightlight():
    cmd = state_to_command_nightlight([5,4], {'on': True, 'brightness': 60})
    assert cmd is not None and 'status' in cmd and 'command' in cmd

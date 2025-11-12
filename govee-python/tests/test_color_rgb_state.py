from govee.domain.devices.states.color_rgb import parse_color_rgb


def test_parse_color_rgb_from_state():
    payload = {"state": {"color": {"red": 255, "green": 0, "blue": 125}}}
    assert parse_color_rgb(payload) == {"red": 255, "green": 0, "blue": 125}


def test_parse_color_rgb_from_op_command():
    payload = {"op": {"command": [[2, 5, 2, 10, 20, 30]]}}
    assert parse_color_rgb(payload) == {"red": 10, "green": 20, "blue": 30}


def test_parse_color_rgb_invalid_values():
    assert parse_color_rgb({}) is None
    assert parse_color_rgb({"state": {"color": {"red": 999}}}) is None

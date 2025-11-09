from govee.domain.devices.states.color import parse_color


def test_parse_rgb_dict_and_hex_string():
    assert parse_color({"rgb": {"r": 1, "g": 2, "b": 3}}) == {"r": 1, "g": 2, "b": 3}
    assert parse_color({"color": "#0A141E"}) == {"r": 10, "g": 20, "b": 30}


def test_parse_numeric_color():
    # 0x0A141E -> r=10,g=20,b=30
    assert parse_color({"color": 0x0A141E}) == {"r": 10, "g": 20, "b": 30}


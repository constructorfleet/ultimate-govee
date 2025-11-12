from govee.domain.devices.states.brightness import parse_brightness


def test_parse_brightness_numeric_and_string():
    assert parse_brightness({"brightness": 70}) == 70
    assert parse_brightness({"bright": "55"}) == 55


def test_parse_brightness_clamps():
    assert parse_brightness({"brightness": 300}) == 100
    assert parse_brightness({"brightness": -5}) == 0

from govee.domain.devices.states.brightness import parse_brightness


def test_parse_brightness_clamps_and_numeric():
    assert parse_brightness({'brightness': 120}) == 100
    assert parse_brightness({'bright': '-5'}) == 0
    assert parse_brightness({'brightness': '55'}) == 55

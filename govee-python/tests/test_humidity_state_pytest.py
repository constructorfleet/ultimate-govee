from govee.domain.devices.states.humidity import parse_humidity


def test_parse_humidity_within_range():
    payload = {"state": {"humidity": {"current": 45, "min": 0, "max": 100}}}
    res = parse_humidity(payload)
    assert res == {
        "calibration": None,
        "range": {"min": 0, "max": 100},
        "current": 45,
        "raw": 45,
    }


def test_parse_humidity_outside_range():
    payload = {"state": {"humidity": {"current": -10, "min": 0, "max": 100}}}
    res = parse_humidity(payload)
    assert res is None

from govee.domain.devices.states.power import parse_power


def test_parse_power_boolean_and_numeric():
    assert parse_power({"power": True}) is True
    assert parse_power({"power": 0}) is False
    assert parse_power({"on": "1"}) is True
    assert parse_power({"on": "off"}) is False


def test_parse_power_missing_returns_none():
    assert parse_power({}) is None

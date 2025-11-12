from govee.domain.devices.states.battery_level import parse_battery


def test_parse_battery_from_top_and_state():
    assert parse_battery({"battery": 85}) == 85
    assert parse_battery({"state": {"battery": 50}}) == 50
    assert parse_battery({"battery": 200}) is None
    assert parse_battery({}) is None

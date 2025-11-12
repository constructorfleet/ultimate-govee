from govee.domain.devices.states.filter_life import parse_filter_life


def test_parse_filter_life_valid_and_invalid():
    assert parse_filter_life({"op": {"command": [[0, 1, 2, 3, 4, 50]]}}) == 50
    assert parse_filter_life({"op": {"command": [[0, 1, 2, 3, 4, 200]]}}) is None
    assert parse_filter_life({"op": {}}) is None

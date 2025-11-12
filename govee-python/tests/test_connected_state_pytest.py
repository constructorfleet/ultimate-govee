from govee.domain.devices.states.connected import parse_connected


def test_parse_connected_variants():
    assert parse_connected({"state": {"isConnected": True}}) is True
    assert parse_connected({"state": {"isOnline": False}}) is False
    assert parse_connected({"state": {"connected": True}}) is True
    assert parse_connected({"state": {"online": False}}) is False
    assert parse_connected({"state": {"online": "yes"}}) is None
    assert parse_connected({}) is None

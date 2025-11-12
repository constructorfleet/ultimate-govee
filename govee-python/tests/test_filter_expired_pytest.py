from govee.domain.devices.states.filter_expired import parse_filter_expired


def test_parse_filter_expired():
    assert parse_filter_expired({"state": {"filterExpired": True}}) is True
    assert parse_filter_expired({"state": {"filterExpired": False}}) is False
    assert parse_filter_expired({"state": {}}) is None

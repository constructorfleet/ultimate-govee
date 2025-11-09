from govee.domain.devices.states.active import parse_active


def test_parse_active_from_state():
    assert parse_active({'state': {'isOn': True}}) is True
    assert parse_active({'state': {'isOn': False}}) is False


def test_parse_active_from_op():
    assert parse_active({'op': {'command': [[0x01]]}}) is True
    assert parse_active({'op': {'command': [[0x00]]}}) is False
    assert parse_active({'op': {'command': [[0x02]]}}) is None

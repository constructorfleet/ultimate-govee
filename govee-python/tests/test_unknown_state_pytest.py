from govee.domain.devices.states.unknown import parse_unknown


def test_parse_unknown_from_op():
    payload = {"op": {"command": [[1, 2, 3, 4, 5]]}}
    res = parse_unknown(payload)
    assert res == {"codes": [1, 2, 3, 4, 5]}


def test_parse_unknown_missing():
    assert parse_unknown({}) is None

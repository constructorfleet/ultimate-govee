from govee.domain.devices.states.effect import parse_effect


def test_parse_effect_from_basic_payload():
    p = {"effect": "Rainbow", "effectId": 3, "effectStr": "AQI="}
    res = parse_effect(p)
    assert isinstance(res, dict)
    assert res["name"] == "Rainbow"
    assert res["id"] == 3
    assert res["op_b64"] is not None


def test_parse_effect_none_for_empty():
    assert parse_effect({}) is None

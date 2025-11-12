from govee.domain.devices.states.light_effect import (EffectStore,
                                                      parse_light_effect_op)


def test_light_effect_op_matching_identifier():
    effects = EffectStore()
    effects.set(0, {"code": 0, "name": "Effect-0"})
    effects.set(100, {"code": 100, "name": "Effect-100"})
    effects.set(1000, {"code": 1000, "name": "Effect-1000"})
    # op payload: [opType, id1, id2, hi, lo]
    payload = {"command": [[3, 5, 4, 0, 100]]}
    res = parse_light_effect_op({"command": payload["command"][0]}, [5, 4], effects)
    assert res == {"code": 100, "name": "Effect-100"}


def test_light_effect_op_non_matching_identifier():
    effects = EffectStore()
    effects.set(100, {"code": 100, "name": "Effect-100"})
    payload = {"command": [[3, 1, 2, 0, 100]]}
    res = parse_light_effect_op({"command": payload["command"][0]}, [5, 4], effects)
    assert res is None

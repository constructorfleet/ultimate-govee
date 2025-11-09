from govee.common.observables import (ForwardBehaviorSubject,
                                      PartialBehaviorSubject)


def test_forward_behavior_subject_holds_value_but_does_not_emit_on_subscribe():
    f = ForwardBehaviorSubject(10)
    seen = []

    # subscribing should not emit the current value
    f.subscribe(lambda v: seen.append(v))
    assert seen == []

    # next should update value and notify subscribers
    f.next(20)
    assert seen == [20]
    assert f.get_value() == 20


def test_partial_behavior_subject_merges_dict_partials_and_notifies():
    p = PartialBehaviorSubject({"a": 1, "b": 2})
    full_seen = []
    partial_seen = []

    p.subscribe(lambda v: full_seen.append(dict(v) if isinstance(v, dict) else v))
    p.partial_subscribe(lambda v: partial_seen.append(dict(v)))

    # send a partial update; partial subscribers get the partial, full get merged
    p.partial_next({"b": 3})
    assert partial_seen == [{"b": 3}]
    assert full_seen and full_seen[-1]["a"] == 1 and full_seen[-1]["b"] == 3

    # send a non-dict partial: should replace the value
    p.partial_next("replaced")
    assert full_seen[-1] == "replaced"

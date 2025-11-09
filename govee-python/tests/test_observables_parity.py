from govee.common.delta_map import DeltaMap
from govee.common.observables import (DeltaSubject, ForwardBehaviorSubject,
                                      PartialBehaviorSubject)


def test_delta_map_ts_api_aliases_exist_and_work():
    dm = DeltaMap()
    # pauseDelta/resumeDelta should exist
    assert hasattr(dm, "pauseDelta")
    assert hasattr(dm, "resumeDelta")
    # clearDelta should exist and not raise
    assert hasattr(dm, "clearDelta")
    dm.clearDelta()
    # deleteMultiple should exist
    assert hasattr(dm, "deleteMultiple")
    # close should exist
    assert hasattr(dm, "close")
    # getDelta alias
    assert hasattr(dm, "getDelta")
    d = dm.getDelta()
    assert hasattr(d, "all")


def test_subject_has_observed_and_forward_subject_apis():
    ds = DeltaSubject()
    assert hasattr(ds, "observed")
    f = ForwardBehaviorSubject(1)
    assert hasattr(f, "getValue")
    # PartialBehaviorSubject should expose partialSubscribe/partialNext
    p = PartialBehaviorSubject({"a": 1})
    assert hasattr(p, "partialSubscribe")
    assert hasattr(p, "partialNext")

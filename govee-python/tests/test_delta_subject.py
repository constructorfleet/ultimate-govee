from govee.common.delta_types import MapDelta
from govee.common.observables import DeltaSubject


def test_delta_subject_forwards_delta():
    ds = DeltaSubject()
    seen = []

    def cb(d):
        seen.append(d)

    ds.subscribe(cb)
    delta = MapDelta(all={'a':1}, added={'a':1}, modified={}, deleted={})
    ds.next_delta(delta)
    assert seen and seen[0].all['a'] == 1

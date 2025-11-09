from govee.common.observables import Subject


def test_subject_calls_subscribers():
    s = Subject()
    seen = []

    def cb(v):
        seen.append(v)

    s.subscribe(cb)
    s.next(1)
    s.next(2)
    assert seen == [1, 2]

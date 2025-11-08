from govee.common.delta_map import DeltaMap


def test_delta_map_add_mod_del():
    dm = DeltaMap()
    seen = []

    def cb(d):
        seen.append(d)

    dm.delta_subject.subscribe(cb)
    dm["a"] = 1
    assert seen and seen[-1].all["a"] == 1
    dm["a"] = 2
    assert seen[-1].all["a"] == 2
    del dm["a"]
    assert "a" not in dm.get_delta().all


def test_pause_resume():
    dm = DeltaMap()
    seen = []
    dm.delta_subject.subscribe(lambda d: seen.append(d))
    dm.pause()
    dm["x"] = 10
    assert not seen
    dm.resume()
    assert seen

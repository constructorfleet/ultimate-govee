import os
from govee.persist.service import PersistService


def test_persist_save_and_load(tmp_path):
    p = tmp_path / "data.json"
    svc = PersistService(path=str(p))
    obj = {"k": "v"}
    svc.save(obj)
    loaded = svc.load()
    assert loaded == obj
    # cleanup
    os.remove(p)


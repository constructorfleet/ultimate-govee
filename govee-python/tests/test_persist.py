import os
import tempfile
from govee.persist.service import PersistService


def test_persist_save_and_load():
    f = tempfile.NamedTemporaryFile(delete=False)
    path = f.name
    f.close()
    svc = PersistService(path=path)
    obj = {"k": "v"}
    svc.save(obj)
    loaded = svc.load()
    assert loaded == obj
    # cleanup
    os.remove(path)

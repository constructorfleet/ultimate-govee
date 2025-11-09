import asyncio
import json
from govee.data.utils.request import request, ApiError
from dataclasses import dataclass
from pathlib import Path


def fake_session_ok_get(method, url, headers=None, params=None, json=None):
    return {"status": 200, "data": {"value": 1}}


def fake_session_ok_post(method, url, headers=None, params=None, json=None):
    return {"status": 200, "data": {"status": 200, "payload": {"x": 2}}}


def fake_session_http_error(method, url, headers=None, params=None, json=None):
    return {"status": 500, "statusText": "Internal Error"}


def fake_session_data_error(method, url, headers=None, params=None, json=None):
    return {"status": 200, "data": {"status": 400, "message": "Bad data"}}


@dataclass
class SimpleModel:
    x: int

    @staticmethod
    def from_dict(d):
        return SimpleModel(x=d.get("payload", {}).get("x", 0))


async def run_get():
    req = request("http://example", headers={}, session=fake_session_ok_get)
    res = await req.get()
    assert res["value"] == 1


async def run_post():
    req = request("http://example", headers={}, payload={"a": 1}, session=fake_session_ok_post)
    res = await req.post()
    assert res["payload"]["x"] == 2


async def run_post_model():
    req = request("http://example", headers={}, payload={"a": 1}, session=fake_session_ok_post)
    res = await req.post(as_type=SimpleModel)
    assert isinstance(res, SimpleModel)
    assert res.x == 2


async def run_http_error():
    req = request("http://example", headers={}, session=fake_session_http_error)
    try:
        await req.get()
        assert False, "expected ApiError"
    except ApiError:
        pass


async def run_data_error():
    req = request("http://example", headers={}, payload={"a": 1}, session=fake_session_data_error)
    try:
        await req.post()
        assert False, "expected ApiError"
    except ApiError:
        pass


async def run_save_to_file(tmp_path):
    target = tmp_path / "out.json"
    req = request("http://example", headers={}, session=fake_session_ok_get)
    await req.get(save_to_file=str(target))
    assert target.exists()
    data = json.loads(target.read_text())
    assert data["value"] == 1


# Runner for the small async tests

def test_request_util():
    import tempfile

    loop = asyncio.new_event_loop()
    tmpd = tempfile.TemporaryDirectory()
    try:
        loop.run_until_complete(run_get())
        loop.run_until_complete(run_post())
        loop.run_until_complete(run_post_model())
        loop.run_until_complete(run_http_error())
        loop.run_until_complete(run_data_error())
        loop.run_until_complete(run_save_to_file(Path(tmpd.name)))
    finally:
        loop.close()
        tmpd.cleanup()

import pytest
from govee.data.openapi import OpenAPIService


@pytest.mark.asyncio
async def test_missing_device_endpoint_behaviour():
    # Expect that OpenAPIService.get('/devices') returns empty list when no devices
    class DummyReq:
        def __init__(self):
            self._resp = {"devices": None}

        async def get(self):
            return self._resp

    svc = OpenAPIService(request=lambda path, headers=None, payload=None: DummyReq())
    devices = await svc.get_device_list()
    assert devices == []


@pytest.mark.asyncio
async def test_control_device_forwards_post():
    calls = []

    def req(path, headers=None, payload=None):
        class R:
            async def post(self):
                calls.append((path, payload))
                return {"data": {"success": True}}

        return R()

    svc = OpenAPIService(request=req)
    res = await svc.control_device("dev1", {"on": True})
    assert res == {"success": True}
    assert calls

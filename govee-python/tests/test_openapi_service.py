import pytest
from govee.data.openapi import OpenAPIService


class DummyReq:
    def __init__(self, resp):
        self._resp = resp

    async def get(self):
        return self._resp

    async def post(self):
        return self._resp


class DummyRequestFactory:
    def __init__(self, resp):
        self.resp = resp

    def __call__(self, url, headers=None, payload=None):
        return DummyReq(self.resp)


@pytest.mark.asyncio
async def test_openapi_get_device_list():
    # realistic fixture shape returned by openapi device list endpoint
    resp = {
        "data": {
            "devices": [
                {"deviceId": "dev-1", "model": "M1", "deviceName": "Lamp 1"},
                {"deviceId": "dev-2", "model": "M2", "deviceName": "Strip"},
            ]
        }
    }
    svc = OpenAPIService(request=DummyRequestFactory(resp))
    devices = await svc.get_device_list()
    assert isinstance(devices, list)
    assert devices[0].id == "dev-1"
    assert devices[1].name == "Strip"


@pytest.mark.asyncio
async def test_openapi_control_device():
    # control endpoint returns a simple success object in many cases
    resp = {"data": {"success": True}}
    svc = OpenAPIService(request=DummyRequestFactory(resp))
    result = await svc.control_device("dev-1", {"on": True})
    assert result.get("success") is True

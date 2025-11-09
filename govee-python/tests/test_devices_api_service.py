import asyncio

from govee.data.api.device import Device, DevicesApiService, DeviceState


class FakeReq:
    def __init__(self, resp):
        self._resp = resp

    async def get(self):
        return self._resp


def fake_request_factory(url, headers, payload=None):
    # verify that client id header may be passed but not required for this fake
    return FakeReq(
        {
            "data": {
                "device": payload.get("deviceId"),
                "model": "H6009",
                "name": "Kitchen",
                "state": {"id": payload.get("deviceId"), "on": True, "brightness": 55},
            }
        }
    )


def test_get_device_info_maps_response():
    svc = DevicesApiService(request=fake_request_factory)
    dev = asyncio.run(svc.get_device_info("dev-99"))
    assert isinstance(dev, Device)
    assert dev.id == "dev-99"
    assert dev.model == "H6009"
    assert dev.name == "Kitchen"
    assert isinstance(dev.state, DeviceState)
    assert dev.state.raw["on"] is True

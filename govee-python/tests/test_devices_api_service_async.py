import asyncio

from govee.data.api.device import DevicesApiService


class FakeReq:
    def __init__(self, resp, expected_headers=None):
        self._resp = resp
        self._expected_headers = expected_headers

    async def get(self):
        return self._resp


def fake_request_factory_assert_headers(expected_headers):
    def _factory(url, headers, payload=None):
        # assert headers contain expected keys/values
        for k, v in (expected_headers or {}).items():
            assert headers.get(k) == v
        return FakeReq(
            {
                "data": {
                    "device": payload.get("deviceId"),
                    "model": "H6009",
                    "name": "Porch",
                    "state": {
                        "id": payload.get("deviceId"),
                        "power": 1,
                        "brightness": 10,
                    },
                }
            }
        )

    return _factory


def test_get_device_info_async_and_header():
    # Ensure an event loop is present for synchronous invocation
    async def _inner():
        expected = {"x-govee-client-id": "client-123"}
        svc = DevicesApiService(request=fake_request_factory_assert_headers(expected))
        dev = await svc.get_device_info("dev-42", client_id="client-123")
        assert dev.id == "dev-42"
        assert dev.state.on is True
        assert dev.state.brightness == 10

    asyncio.run(_inner())

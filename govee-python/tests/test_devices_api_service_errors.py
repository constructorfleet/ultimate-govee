from govee.data.api.device import DevicesApiService
from govee.data.utils.request import ApiError, ApiResponseStatus


class FakeReqError:
    def __init__(self, resp):
        self._resp = resp

    async def get(self):
        # simulate Request.get behavior which may raise ApiError for non-200
        raise ApiError(
            "HTTP failure", ApiResponseStatus(statusCode=500, message="Server Error")
        )


def fake_request_factory_http_error(url, headers, payload=None):
    return FakeReqError(None)


def test_get_device_info_http_error_propagates():
    svc = DevicesApiService(request=fake_request_factory_http_error)
    import asyncio

    async def _run():
        try:
            await svc.get_device_info("dev-err")
            return False
        except ApiError as exc:
            assert exc.status.statusCode == 500
            return True

    raised = asyncio.run(_run())
    assert raised


class FakeReqContentError:
    def __init__(self, resp):
        self._resp = resp

    async def get(self):
        # simulate a content response where data.status != 200 (for post in Request)
        # But get() in Request only checks HTTP code; for the test, emulate a
        # response shaped as content with an error so our service may need to
        # detect it if applicable.
        return {"status": 200, "data": {"status": 400, "message": "Bad payload"}}


def fake_request_factory_content_error(url, headers, payload=None):
    return FakeReqContentError(None)


def test_get_device_info_content_error_not_raised_for_get():
    # The Request.get implementation doesn't treat embedded data.status as an error
    # (only post checks data.status). Ensure our service doesn't raise here.
    svc = DevicesApiService(request=fake_request_factory_content_error)
    import asyncio

    async def _run():
        return await svc.get_device_info("dev-400")

    dev = asyncio.run(_run())
    # since returned data contains no model/name/state, dev should exist but be minimal
    assert dev.id == "dev-400"

import asyncio
import time

import pytest
from govee.data.openapi.client import (
    AsyncOpenApiClient,
    OpenApiNotFound,
    OpenApiTimeout,
)


def test_get_iot_credentials_404_raises():
    def fake_session(method, url, **kwargs):
        return {"status": 404, "statusText": "Not Found", "data": {}}

    client = AsyncOpenApiClient(
        base_url="http://api", session=fake_session, retries=1, timeout=1
    )

    with pytest.raises(OpenApiNotFound):
        asyncio.get_event_loop().run_until_complete(
            client.get_iot_credentials("device-123")
        )


def test_get_iot_credentials_timeout_raised():
    # session sleeps longer than timeout
    def slow_session(method, url, **kwargs):
        time.sleep(0.05)
        return {"status": 200, "statusText": "OK", "data": {}}

    client = AsyncOpenApiClient(
        base_url="http://api", session=slow_session, retries=1, timeout=0.01
    )

    with pytest.raises(OpenApiTimeout):
        asyncio.get_event_loop().run_until_complete(
            client.get_iot_credentials("device-123")
        )


def test_retry_on_500_then_success():
    calls = {"n": 0}

    def flaky_session(method, url, **kwargs):
        calls["n"] += 1
        if calls["n"] < 3:
            return {"status": 500, "statusText": "Err", "data": {}}
        return {"status": 200, "statusText": "OK", "data": {"data": {"endpoint": "ok"}}}

    client = AsyncOpenApiClient(
        base_url="http://api", session=flaky_session, retries=4, timeout=1
    )
    res = asyncio.get_event_loop().run_until_complete(client.get_iot_credentials("did"))
    assert isinstance(res, dict)
    assert res.get("endpoint") == "ok"

import pytest
from govee.data.iot.iot_client import IoTClient


@pytest.mark.asyncio
async def test_connect_with_backoff_eventually_connects():
    client = IoTClient()

    # make connect fail twice then succeed
    attempts = {"n": 0}

    async def flaky_connect():
        attempts["n"] += 1
        if attempts["n"] < 3:
            raise RuntimeError("connect failed")
        # on success, set connected and return
        client.connected = True
        return

    # monkeypatch the client's connect implementation
    client.connect = flaky_connect

    # attempt to connect with backoff; should eventually succeed
    await client.connect_with_backoff(initial_backoff=0.001, max_attempts=5, jitter=0)

    assert client.connected is True
    assert attempts["n"] == 3


@pytest.mark.asyncio
async def test_connect_with_backoff_fails_when_exhausted():
    client = IoTClient()

    async def always_fail():
        raise RuntimeError("nope")

    client.connect = always_fail

    with pytest.raises(RuntimeError):
        await client.connect_with_backoff(
            initial_backoff=0.001, max_attempts=3, jitter=0
        )

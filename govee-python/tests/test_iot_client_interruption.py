import asyncio

import pytest
from govee.data.iot.iot_client import AsyncIotMessage, IoTClient


@pytest.mark.asyncio
async def test_interruption_queueing():
    client = IoTClient()
    await client.subscribe("govee/device/#")
    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload))

    await client.create({"topic": "govee/device/#"}, Handler())
    await client.connect()

    # interrupt: will queue messages instead of delivering
    client.interrupt()
    client.simulate_incoming(AsyncIotMessage("govee/device/5/state", {"val": 5}))
    await asyncio.sleep(0.01)
    assert len(received) == 0

    client.resume()
    await asyncio.sleep(0.01)
    assert len(received) >= 1

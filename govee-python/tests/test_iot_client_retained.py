import asyncio

import pytest

from govee.data.iot.iot_client import IoTClient


@pytest.mark.asyncio
async def test_retained_delivered_on_subscribe():
    client = IoTClient()
    # publish retained before any subscriber exists
    await client.publish("govee/device/ret/state", {"v": 42}, retained=True)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload, retain))

    # now subscribe and handler should get the retained message
    await client.subscribe("govee/device/#")
    await client.create({"topic": "govee/device/#"}, Handler())
    await client.connect()

    # allow any async delivery
    await asyncio.sleep(0.01)
    assert any(r[2] for r in received)

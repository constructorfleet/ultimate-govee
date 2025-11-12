import asyncio

import pytest

from govee.data.iot import IoTClient


@pytest.mark.asyncio
async def test_connect_subscribe_publish_and_receive():
    client = IoTClient()

    received = []

    async def cb(topic, payload, retained=False):
        received.append((topic, payload, retained))

    await client.connect()
    await client.subscribe("home/room/light")
    client.register_callback(cb)

    await client.publish("home/room/light", {"on": True})

    # allow loop to process
    await asyncio.sleep(0)

    assert received == [("home/room/light", {"on": True}, False)]


@pytest.mark.asyncio
async def test_retained_message_delivered_on_subscribe():
    client = IoTClient()
    await client.connect()

    # publish a retained message before subscribing
    await client.publish("sensor/1/state", {"temp": 22}, retained=True)

    received = []

    async def cb(topic, payload, retained=False):
        received.append((topic, payload, retained))

    client.register_callback(cb)
    await client.subscribe("sensor/1/state")

    # allow at least one event loop turn
    await asyncio.sleep(0)

    assert received == [("sensor/1/state", {"temp": 22}, True)]


@pytest.mark.asyncio
async def test_qos_retry_mechanics():
    client = IoTClient()
    await client.connect()

    # publish with qos=1 should be tracked in inflight and retryable
    msg = await client.publish("device/ack", {"cmd": "ping"}, qos=1)
    assert client.inflight_count >= 1

    # simulate ack via handler
    client.acknowledge(msg)
    await client.retry_inflight()
    assert client.inflight_count == 0

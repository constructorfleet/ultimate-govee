import asyncio
import pytest

from govee.data.iot.iot_client import IoTClient, AsyncIotMessage


@pytest.mark.asyncio
async def test_publish_and_deliver_with_connected_handler():
    calls = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            calls.append((topic, payload))

    client = IoTClient()
    handler = Handler()
    await client.create({'topic': 'govee/device/#'}, handler)
    await client.connect()

    await client.publish('govee/device/9/state', {'v': 9})
    # allow tasks
    await asyncio.sleep(0.01)

    assert any(c[0] == 'govee/device/9/state' for c in calls)


@pytest.mark.asyncio
async def test_register_unregister_callback():
    client = IoTClient()
    called = []

    async def cb(topic, payload, retain):
        called.append((topic, payload))

    await client.subscribe('govee/device/#')
    client.register_callback(cb)
    await client.connect()
    # simulate incoming
    client.simulate_incoming(AsyncIotMessage('govee/device/2/state', {'k': 2}))
    await asyncio.sleep(0.01)
    assert len(called) >= 1

    client.unregister_callback(cb)
    called.clear()
    client.simulate_incoming(AsyncIotMessage('govee/device/2/state', {'k': 2}))
    await asyncio.sleep(0.01)
    assert len(called) == 0


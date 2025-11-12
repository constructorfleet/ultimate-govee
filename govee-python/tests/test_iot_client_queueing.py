import asyncio
from govee.data.iot.iot_client import IoTClient, AsyncIotMessage


def test_queueing_while_disconnected():
    client = IoTClient()
    # subscribe to topic
    asyncio.get_event_loop().run_until_complete(client.subscribe('govee/device/#'))

    # simulate disconnected
    client.connected = False

    # simulate incoming messages while disconnected
    m1 = AsyncIotMessage('govee/device/1/state', {'t': 1})
    m2 = AsyncIotMessage('govee/device/2/state', {'t': 2})
    client.simulate_incoming(m1)
    client.simulate_incoming(m2)

    assert client.queued_count == 2

    # connect and resume
    asyncio.get_event_loop().run_until_complete(client.connect())
    client.resume()

    # allow tasks to run
    asyncio.get_event_loop().run_until_complete(asyncio.sleep(0.01))

    assert client.queued_count == 0


def test_queue_bound_and_drop_callbacks():
    client = IoTClient()
    client.set_incoming_queue_max(1)
    dropped = []

    def on_drop(msg):
        dropped.append(msg)

    client.register_drop_callback(on_drop)

    # simulate 3 incoming messages
    client.simulate_incoming(AsyncIotMessage('govee/device/1/state', {'t': 1}))
    client.simulate_incoming(AsyncIotMessage('govee/device/2/state', {'t': 2}))
    client.simulate_incoming(AsyncIotMessage('govee/device/3/state', {'t': 3}))

    # queue max is 1, so two drops should have occurred
    assert client.dropped_count >= 2
    assert len(dropped) >= 2


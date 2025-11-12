import pytest

from govee.data.iot.iot_client import IoTClient, AsyncIotMessage


@pytest.mark.asyncio
async def test_inflight_ack_by_id():
    client = IoTClient()
    await client.subscribe('govee/device/#')
    await client.connect()

    # publish qos=1 message -> should return an AsyncIotMessage
    msg = await client.publish('govee/device/42/state', {'val': 1}, qos=1)

    # message should expose a message_id assigned by the client
    assert hasattr(msg, 'message_id')
    mid = getattr(msg, 'message_id')
    assert mid is not None

    # simulate an incoming ack that references the message_id
    ack_payload = {'ack_for_id': mid}
    client.simulate_incoming(AsyncIotMessage('govee/device/42/ack', ack_payload))

    # process inflight retries/acks
    await client.retry_inflight()

    # message should be acknowledged / removed from inflight
    assert msg.acked or client.inflight_count == 0


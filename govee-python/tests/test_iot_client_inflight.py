import pytest

from govee.data.iot.iot_client import AsyncIotMessage, IoTClient


@pytest.mark.asyncio
async def test_qos_inflight_ack_and_retry():
    client = IoTClient()
    await client.subscribe("govee/device/#")

    # publish qos=1 message, it should appear in inflight
    await client.connect()
    msg = await client.publish("govee/device/1/state", {"x": 1}, qos=1)
    assert client.inflight_count >= 1

    # simulate ack payload delivered
    ack_payload = {"ack_for": {"x": 1}}
    client.simulate_incoming(AsyncIotMessage("govee/device/1/ack", ack_payload))

    # run retry/routine to process acks
    await client.retry_inflight()

    assert client.inflight_count == 0 or msg.acked


@pytest.mark.asyncio
async def test_send_with_retry_schedules_backoff():
    client = IoTClient()
    await client.subscribe("govee/device/#")
    # schedule with backoff intervals
    await client.send_with_retry(
        "govee/device/1/state", {"y": 2}, qos=1, backoff_intervals=[0.001, 0.001]
    )
    # scheduled retries should have been registered (private attribute)
    assert hasattr(client, "_scheduled_retries") and len(client._scheduled_retries) >= 1

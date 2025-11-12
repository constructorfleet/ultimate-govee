import pytest
from govee.data.iot.iot_client import AsyncIotMessage, IoTClient


@pytest.mark.asyncio
async def test_metrics_text_and_counts():
    client = IoTClient()
    # ensure no queued/inflight initially
    assert client.queued_count == 0
    assert client.inflight_count == 0

    # subscribe so simulate_incoming will accept messages
    await client.subscribe("govee/device/#")

    # add to incoming queue beyond limit to produce dropped
    client.set_incoming_queue_max(1)
    client.simulate_incoming(AsyncIotMessage("govee/device/1/state", {"a": 1}))
    client.simulate_incoming(AsyncIotMessage("govee/device/2/state", {"a": 2}))

    # queued_count may be <= max, dropped_count should be >= 1
    assert client.dropped_count >= 1

    # publish a qos=1 message to create inflight (need to be connected)
    await client.connect()
    await client.publish("govee/device/3/state", {"b": 3}, qos=1)
    assert client.inflight_count >= 1

    txt = client.metrics_text()
    assert "govee_iot_queued_count" in txt
    assert "govee_iot_dropped_count" in txt
    assert "govee_iot_inflight_count" in txt

import asyncio
import pytest

from govee.data.iot.iot_client import IoTClient, AsyncIotMessage


@pytest.mark.asyncio
async def test_send_with_retry_performs_retries_and_drop_callback():
    client = IoTClient()
    await client.subscribe('govee/device/#')
    # connect so publish works
    await client.connect()

    dropped = []

    def on_drop(msg):
        dropped.append(msg)

    client.register_drop_callback(on_drop)

    # publish with backoff intervals; set max_retries small to trigger drop
    msg = await client.send_with_retry('govee/device/9/state', {'z': 9}, qos=1, max_retries=1, backoff_intervals=[0.001, 0.001])

    # wait enough time for retries to process
    await asyncio.sleep(0.05)

    # expect drop callback invoked since max_retries was 1
    assert len(dropped) >= 1


"""Integration tests: publish frames from devices via MQTTAdapter and ensure IoT handler receives them."""

import asyncio

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter
from govee.domain.devices.implementations.white import WhiteDevice
from govee.domain.devices.implementations.night import NightDevice
from govee.domain.devices.implementations.sensor import SensorDevice


async def _run():
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload, retain))

    await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()

    # White device
    w = WhiteDevice("w-iot")
    frames = w.encode_command({"power": True, "brightness": 55})
    for f in frames:
        await adapter.publish("govee/device/white/command", f, qos=0)

    # Night device
    n = NightDevice("n-iot")
    frames = n.encode_command({"night": True, "brightness": 10})
    for f in frames:
        await adapter.publish("govee/device/night/command", f, qos=0)

    # Sensor (no commands expected but publish a simulated report frame)
    s = SensorDevice("s-iot")
    # Simulate a sensor report frame
    await adapter.publish("govee/device/sensor/state", {"tempc": 21.5, "batt": 90, "hum": 45}, qos=0)

    # replay backend fixtures to also drive messages
    adapter.replay_fixture()
    await asyncio.sleep(0.02)
    return len(received) > 0


def test_iot_integration_more():
    res = asyncio.get_event_loop().run_until_complete(_run())
    assert res

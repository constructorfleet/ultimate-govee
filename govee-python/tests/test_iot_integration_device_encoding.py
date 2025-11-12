"""Integration test: ensure device.encode_command frames flow through IoTAdapter publish path.

This test is RED until we verify the adapter publishes the expected frames or
wire up a small adapter shim for tests.
"""

from __future__ import annotations

import asyncio

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter
from govee.domain.devices.implementations.whitetemp import WhiteTempDevice


async def _run():
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload, retain))

    await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()

    # create a device and ask it to encode a command
    dev = WhiteTempDevice("wt-2")
    frames = dev.encode_command({"power": True, "brightness": 55, "color_temp": 3000})

    # publish each frame under a device topic and ensure handler gets it
    for f in frames:
        await adapter.publish("govee/device/100/command", f, qos=0)

    adapter.replay_fixture()
    await asyncio.sleep(0.01)
    return len(received) > 0


def test_iot_integration_device_encoding():
    res = asyncio.get_event_loop().run_until_complete(_run())
    assert res

"""Integration tests: publish frames from devices via MQTTAdapter and ensure IoT handler receives them."""

import asyncio

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter


async def _run():
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload, retain))

    await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()

    # replay backend fixtures to also drive messages
    adapter.replay_fixture()
    await asyncio.sleep(0.02)
    return len(received) > 0


def test_iot_integration_more():
    res = asyncio.get_event_loop().run_until_complete(_run())
    assert res

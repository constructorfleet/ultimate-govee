import asyncio

import pytest
from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter


@pytest.mark.asyncio
async def test_adapter_compatibility_publish_subscribe():
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload, retain))

    await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()

    # publish through adapter and ensure no exceptions
    await adapter.publish("govee/device/100/state", {"v": 100}, qos=0)

    # replay backend and ensure handler receives messages
    adapter.replay_fixture()
    await asyncio.sleep(0.01)
    assert len(received) >= 1

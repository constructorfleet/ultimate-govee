import asyncio

import pytest

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter
from govee.data.common.paho_adapter import PahoBackend


@pytest.mark.asyncio
async def test_swappable_backend_fake_and_paho_interface():
    # Fake backend
    fake = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=fake)

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            pass

    await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()
    adapter.replay_fixture()
    await asyncio.sleep(0.01)

    # paho backend presence: ensure code path exists; we do not actually
    # open network connections during tests. The PahoBackend class should
    # expose the attach(client) API used by MQTTAdapter.
    p = PahoBackend(host="localhost", port=1883, topics=["govee/device/#"])
    # attach should not throw (no broker required for attaching in our minimal impl)
    p.attach(adapter.client)
    p.stop()

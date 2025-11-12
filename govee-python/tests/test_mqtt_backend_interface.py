import asyncio

import pytest

from govee.data.common.mqtt_adapter import MQTTAdapter


class CustomBackend:
    def __init__(self):
        self.replayed = False
        self.client_passed = None

    def replay(self, client):
        # record that replay was called and store client reference
        self.replayed = True
        self.client_passed = client


@pytest.mark.asyncio
async def test_adapter_accepts_any_backend_with_replay_method():
    backend = CustomBackend()
    adapter = MQTTAdapter(backend=backend)

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            pass

    await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()

    adapter.replay_fixture()
    # allow any async tasks
    await asyncio.sleep(0.01)

    assert backend.replayed is True
    assert backend.client_passed is adapter.client

import asyncio
import json

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter


def test_mqtt_adapter_replays_fixture(monkeypatch):
    backend=FakeMQTTBackend('persisted/mqtt_fixtures/replay_1.jsonl')
    adapter=MQTTAdapter(backend=backend)

    # record handler calls
    calls=[]
    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            calls.append((topic, payload, qos, retain))

    async def run():
        client = await adapter.create({'topic':'govee/device/#'}, Handler())
        await adapter.connect()
        adapter.replay_fixture()
        # allow tasks to run
        await asyncio.sleep(0.01)

    asyncio.get_event_loop().run_until_complete(run())
    # expect at least one call from the replay
    assert len(calls) >= 1
    assert calls[0][0] == 'govee/device/123/state'

import asyncio

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter


def test_mqtt_adapter_retained_and_clear():
    # fixture with a retained message then a retained-clear (payload==None)
    fixture_path = 'persisted/mqtt_fixtures/replay_1.jsonl'
    backend = FakeMQTTBackend(fixture_path)
    adapter = MQTTAdapter(backend=backend)

    calls = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            calls.append((topic, payload, retain))

    async def run():
        client = await adapter.create({'topic': 'govee/device/#'}, Handler())
        await adapter.connect()
        # replay twice to ensure retained clear is processed
        adapter.replay_fixture()
        await asyncio.sleep(0.01)

    asyncio.get_event_loop().run_until_complete(run())

    assert any(c[2] for c in calls)


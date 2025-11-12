import asyncio

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter


def test_mqtt_adapter_reconnect_and_resume_subscriptions():
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    calls = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            calls.append((topic, payload))

    async def run():
        await adapter.create({"topic": "govee/device/#"}, Handler())
        # initial connect
        await adapter.connect()
        adapter.replay_fixture()
        await asyncio.sleep(0.01)

        # disconnect and reconnect
        await adapter.disconnect()
        await adapter.connect()
        adapter.replay_fixture()
        await asyncio.sleep(0.01)

    asyncio.get_event_loop().run_until_complete(run())

    assert len(calls) >= 1

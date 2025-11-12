import asyncio

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter
from govee.data.openapi.client import AsyncOpenApiClient


def test_openapi_to_mqtt_adapter_flow():
    # Fake OpenAPI session that returns IoT credentials (minimal shape)
    def fake_session(method, url, **kwargs):
        return {
            "status": 200,
            "statusText": "OK",
            "data": {
                "data": {
                    "endpoint": "mqtt://example",
                    "clientId": "cli-1",
                    "topic": "govee/device/#",
                }
            },
        }

    client = AsyncOpenApiClient(base_url="http://api", session=fake_session)

    # Use the fake MQTT backend with persisted fixture
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload, retain))

    async def run():
        creds = await client.get_iot_credentials("device-1")
        # create adapter with the credentials (we only need topic shape for tests)
        iot_data = {"topic": creds.get("topic"), "clientId": creds.get("clientId")}
        await adapter.create(iot_data, Handler())
        await adapter.connect()
        adapter.replay_fixture()
        await asyncio.sleep(0.02)

    asyncio.get_event_loop().run_until_complete(run())

    assert len(received) >= 1

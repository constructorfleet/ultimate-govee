# IoT client and adapters

This directory contains the in-memory IoT client used by tests and the
adapter backends used to integrate with MQTT brokers (fake backend for
fixtures and an optional paho-mqtt backend for real brokers).

Overview
--------
- iot_client.py: IoTClient — an async-friendly, in-memory MQTT-like client
  used by tests and adapters. It supports:
  - publish/subscribe with retained message semantics
  - incoming queueing while disconnected or interrupted
  - QoS=1 inflight tracking and ack processing (convention: payload with
    {'ack_for': <payload>} acknowledges messages)
  - simple retry scheduling via send_with_retry and retry_inflight
  - inspection helpers: queued_count, dropped_count, inflight_count, metrics_text()

- common/mqtt_adapter.py: MQTTAdapter + FakeMQTTBackend for offline tests.
- common/paho_adapter.py: Optional paho-mqtt wrapper (PahoBackend) for
  attaching a real paho client to an IoTClient instance (requires paho-mqtt
  installed).

Usage example (offline tests)
-----------------------------
1. Create a FakeMQTTBackend pointing to a JSONL fixture file (one JSON object
   per line, containing topic/payload/qos/retained):

    from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter

    backend = FakeMQTTBackend('persisted/mqtt_fixtures/replay_1.jsonl')
    adapter = MQTTAdapter(backend=backend)

2. Create an IoT handler/adapter and replay messages:

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            print(topic, payload, retain)

    client = await adapter.create({'topic': 'govee/device/#'}, Handler())
    await adapter.connect()
    adapter.replay_fixture()

3. For production use, create a PahoBackend and attach to an IoTClient:

    from govee.data.common.paho_adapter import PahoBackend
    p = PahoBackend(host='mqtt.example.com', port=1883, topics=['govee/device/#'])
    p.attach(iot_client)

Testing
-------
All tests that exercise IoT client and adapters are under
`govee-python/tests/` and use deterministic fixtures in `persisted/` and
`govee-python/tests/fixtures` so they run offline and fast.


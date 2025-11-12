import socket
import time
import json
import pytest

from govee.data.common.paho_adapter import PahoBackend
from govee.data.iot.iot_client import IoTClient


def broker_available(host='localhost', port=1883, timeout=0.5):
    try:
        s = socket.create_connection((host, port), timeout)
        s.close()
        return True
    except Exception:
        return False


@pytest.mark.skipif(not broker_available(), reason='local MQTT broker not available')
@pytest.mark.timeout(10)
def test_iot_paho_e2e_publish_subscribe():
    # This test requires a local MQTT broker running on localhost:1883
    backend = PahoBackend(host='localhost', port=1883, topics=['test/e2e/#'])
    client = IoTClient()
    backend.attach(client)

    # simple handler to capture incoming messages
    received = []

    async def cb(topic, payload, retain):
        received.append((topic, payload))

    client.register_callback(cb)

    # connect backend and client
    backend.connect(max_attempts=3, initial_backoff=0.1)
    time.sleep(0.2)

    # publish via paho client directly
    try:
        import paho.mqtt.publish as publish
        publish.single('test/e2e/1', json.dumps({'x': 1}), hostname='localhost')
    except Exception:
        pytest.skip('paho publish not available')

    # allow for delivery
    time.sleep(0.5)

    assert any(t.startswith('test/e2e/') for t, _ in received)

    backend.stop()

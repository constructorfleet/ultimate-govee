import govee.data.common.paho_adapter as pa


class FakeClient:
    def __init__(self):
        self.subscribed = []
        self._on_connect = None
        self._on_message = None
        self.loop_started = False

    def subscribe(self, topic, qos=0):
        self.subscribed.append(topic)

    def unsubscribe(self, topic):
        try:
            self.subscribed.remove(topic)
        except ValueError:
            pass

    def connect(self, host, port, keepalive):
        # simulate immediate on_connect call
        if hasattr(self, 'on_connect') and callable(self.on_connect):
            # call on_connect callback if set
            try:
                self.on_connect(self, None, None, 0)
            except Exception:
                pass

    def loop_start(self):
        self.loop_started = True

    def loop_stop(self):
        self.loop_started = False

    def disconnect(self):
        pass


def test_paho_backend_unsubscribe_and_resubscribe(monkeypatch):
    # replace mqtt.Client with our fake client
    monkeypatch.setattr(pa, 'mqtt', type('M', (), {'Client': lambda *a, **k: FakeClient()}))

    backend = pa.PahoBackend(host='localhost', port=1883, topics=['a/#', 'b/#'])

    # attach no-op iot client (not used in this test)
    backend.attach(None)

    # first connect should subscribe
    backend.connect(max_attempts=1, initial_backoff=0.001)
    assert backend._connected is True
    assert hasattr(backend, '_client')
    assert backend._client.subscribed == ['a/#', 'b/#']

    # stop should unsubscribe
    backend.stop()
    assert backend._client.subscribed == []

    # reconnect should resubscribe
    backend.connect(max_attempts=1, initial_backoff=0.001)
    assert backend._client.subscribed == ['a/#', 'b/#']


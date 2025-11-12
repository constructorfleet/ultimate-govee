from govee.data.common.paho_adapter import PahoBackend


class FakeClient:
    def __init__(self):
        self._calls = 0
        self.loop_started = False

    def connect(self, host, port, keepalive):
        self._calls += 1
        if self._calls < 3:
            raise RuntimeError("connect failed")
        return 0

    def loop_start(self):
        self.loop_started = True

    def disconnect(self):
        pass


def test_paho_backend_retries_and_connects(monkeypatch):
    # monkeypatch the mqtt.Client to our fake
    import govee.data.common.paho_adapter as pa

    monkeypatch.setattr(
        pa, "mqtt", type("M", (), {"Client": lambda *a, **k: FakeClient()})
    )

    backend = PahoBackend(host="localhost", port=1883, topics=["test/#"])

    # should not raise and should eventually connect
    backend.connect(max_attempts=5, initial_backoff=0.001)

    assert getattr(backend, "_connected", False) is True

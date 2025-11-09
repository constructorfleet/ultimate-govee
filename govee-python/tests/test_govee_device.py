from govee.data.govee_device import from_lan_payload


def test_from_lan_payload_creates_device():
    payload = {
        "device": "dev123",
        "model": "H6009",
        "name": "Test Light",
        "version": "0.1.0",
        "ip": "10.0.0.5",
        "mac": "AA:BB:CC:DD:EE:FF",
    }
    d = from_lan_payload(payload)
    assert d.device_id == "dev123"
    assert d.model == "H6009"
    assert d.addresses["ip"] == "10.0.0.5"


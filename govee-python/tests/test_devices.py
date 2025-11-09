from govee.domain.devices.device import from_payload


def test_device_from_payload():
    p = {"device": "xyz", "model": "M1", "name": "Lamp", "version": "0.0.1", "ip": "1.2.3.4", "mac": "aa:bb"}
    d = from_payload(p)
    assert d.id == "xyz"
    assert d.model == "M1"
    assert d.addresses["ip"] == "1.2.3.4"


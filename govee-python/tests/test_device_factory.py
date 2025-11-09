from govee.domain.devices.factory import make_device_from_advert


def test_make_device_from_advert_known_model():
    payload = {"id": "dev-1", "name": "Lamp", "mac": "AA:BB"}
    d = make_device_from_advert("H6009", payload)
    assert d is not None
    assert d.model == "H6009"
    assert d.addresses["mac"] == "AA:BB"


def test_make_device_from_advert_unknown_model():
    assert make_device_from_advert("X999", {"id": "d"}) is None


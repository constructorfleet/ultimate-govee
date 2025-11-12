import json
import os


FIXTURE_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


def load_products():
    p = os.path.join(FIXTURE_DIR, "govee.products.json")
    with open(p) as f:
        return json.load(f)


def load_devices():
    p = os.path.join(FIXTURE_DIR, "govee.devices.json")
    with open(p) as f:
        return json.load(f)


def test_fixtures_load():
    products = load_products()
    devices = load_devices()
    # basic assertions that fixtures were copied correctly
    assert isinstance(products, dict)
    assert "H6107" in products
    assert isinstance(devices, dict)
    assert "devices" in devices


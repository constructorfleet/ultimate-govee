import json
import os
import sys

sys.path.insert(0, os.path.join(os.getcwd(), 'src'))

from govee.domain.devices.implementations.rgbic import RGBICDevice


FIX = os.path.join(os.path.dirname(__file__), 'fixtures')


def load_fixture(name):
    with open(os.path.join(FIX, name)) as f:
        return json.load(f)


def test_rgbic_manifest_present():
    m = load_fixture('ts_device_manifest_rgbic.json')
    assert m['device'] == 'RGBICLightDevice'
    assert 'PowerState' in m['state_factories']



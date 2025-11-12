import os, sys, json
sys.path.insert(0, os.path.join(os.getcwd(), 'src'))

from govee.domain.devices.implementations.rgb import RGBDevice

FIX=os.path.join(os.path.dirname(__file__),'fixtures')

def load(f):
    with open(os.path.join(FIX,f)) as fh:
        return json.load(fh)


def test_rgb_manifest_present():
    m=load('ts_device_manifest_rgb.json')
    assert m['device']=='RGBLightDevice'



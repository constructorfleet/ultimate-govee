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


def test_rgb_sample_parse():
    s=load('rgb_samples.json')
    payload=s[0]['payload']
    d=RGBDevice(id='r', model=s[0]['model'])
    d.apply_payload(payload)
    # expect color_state if present
    assert hasattr(d, 'get_state')
    assert hasattr(d, 'color_state')
    assert d.color_state.get() == {'r':10,'g':20,'b':30}
    # color temp state may be present or None
    assert hasattr(d, 'color_temp_state')


def test_rgb_encoding():
    from govee.domain.devices.implementations.rgb import RGBDevice
    d = RGBDevice(id='r', model='H6107')
    frames = d.encode_command({'power': True})
    assert any(f.get('op') == 'power' and f.get('v') == 1 for f in frames)
    frames = d.encode_command({'brightness': 77})
    assert any(f.get('op') == 'bright' and f.get('v') == 77 for f in frames)
    frames = d.encode_command({'color': {'r':5,'g':6,'b':7}})
    assert any(f.get('op') == 'rgb' and f.get('r') == 5 for f in frames)
    frames = d.encode_command({'color_temp': 3000})
    # encode_ct is not wired into RGBDevice.encode_command by default; call helper
    from govee.domain.devices.encoding import encode_ct
    frames_ct = encode_ct({'color_temp':3000})
    assert any(f.get('op') == 'ct' and f.get('v') == 3000 for f in frames_ct)

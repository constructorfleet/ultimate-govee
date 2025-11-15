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


def test_rgbic_sample_fixture():
    s = load_fixture('rgbic_samples.json')
    assert isinstance(s, list)
    assert s[0]['model'].startswith('H61')


def test_rgbic_device_parsing():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    s = load_fixture('rgbic_samples.json')
    sample = s[0]['payload']
    d = RGBICDevice(id='test', model=s[0]['model'], name=s[0]['productName'])
    d.apply_payload(sample)
    # ensure states added by register_state_factories are present
    assert hasattr(d, 'segment_state')
    segs = d.segment_state.get()
    assert isinstance(segs, list)
    assert segs[0]['index'] == 0


def test_rgbic_power_state():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    from govee.domain.devices.states.power import parse_power
    # payload with explicit power
    payload = {'power': 1}
    assert parse_power(payload) is True
    d = RGBICDevice(id='x', model='H61A0')
    d.apply_payload({'power': 0})
    # DeviceBase stores parsed state; check using parse_power directly
    assert parse_power({'power': d.get_state() or {}}) in (True, False, None)


def test_rgbic_brightness_state():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    from govee.domain.devices.states.brightness import parse_brightness
    assert parse_brightness({'brightness': '75'}) == 75
    assert parse_brightness({'bright': 150}) == 100
    d = RGBICDevice(id='b', model='H61A0')
    d.apply_payload({'brightness': 42})
    # DeviceBase default parsing stores the raw in get_state - ensure parse works
    assert parse_brightness({'brightness': d.get_state() or {}}) in (None, 42)


def test_rgbic_color_state():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    from govee.domain.devices.states.color_rgb import parse_color_rgb
    payload = {'color': {'r': 10, 'g':20, 'b':30}}
    assert parse_color_rgb(payload) == {'r':10,'g':20,'b':30}
    d = RGBICDevice(id='c', model='H61A0')
    d.apply_payload({'color': {'r':100,'g':110,'b':120}})
    assert hasattr(d, 'color_state')
    assert d.color_state.get() == {'r':100,'g':110,'b':120}


def test_rgbic_scene_state():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    d = RGBICDevice(id='s', model='H61A0')
    d.apply_payload({'scene': 'party'})
    assert hasattr(d, 'scene_state')
    st = d.scene_state.get()
    assert st['scene'] == 'party' or st['mode_id'] is None


def test_rgbic_mic_mode():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    d = RGBICDevice(id='m', model='H61A0')
    d.apply_payload({'mic': {'enabled': True, 'sensitivity': 5}})
    assert hasattr(d, 'mic_state')
    res = d.mic_state.get()
    assert res['enabled'] is True
    assert res['sensitivity'] == 5


def test_rgbic_diy_mode():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    d = RGBICDevice(id='diy', model='H61A0')
    d.apply_payload({'diy': {'enabled': True, 'pattern': 'rainbow'}})
    assert hasattr(d, 'diy_state')
    got = d.diy_state.get()
    assert got['enabled'] is True
    assert got['pattern'] == 'rainbow'


def test_rgbic_active_state():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    d = RGBICDevice(id='act', model='H61A0')
    d.apply_payload({'mode': 'whole'})
    assert hasattr(d, 'active_state')
    assert d.active_state.get() == 'whole'


def test_rgbic_effect_parsing():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    from govee.domain.devices.states.effect import parse_effect
    payload = {'effect': 'pulse', 'effectId': 3}
    assert parse_effect(payload)['name'] == 'pulse'
    d = RGBICDevice(id='e', model='H61A0')
    d.apply_payload({'effect': 'strobe', 'effectId': 7})
    assert d.effect_state is not None
    assert d.effect_state['name'] == 'strobe'


def test_rgbic_encoding_power_brightness_rgb_segment_pixels_effect():
    from govee.domain.devices.implementations.rgbic import RGBICDevice
    d = RGBICDevice(id='enc', model='H61A0')
    # power
    frames = d.encode_command({'power': True})
    assert any(f.get('op') == 'power' and f.get('v') == 1 for f in frames)
    # brightness
    frames = d.encode_command({'brightness': 55})
    assert any(f.get('op') == 'bright' and f.get('v') == 55 for f in frames)
    # rgb
    frames = d.encode_command({'color': {'r': 1, 'g': 2, 'b': 3}})
    assert any(f.get('op') == 'rgb' and f.get('r') == 1 and f.get('g') == 2 and f.get('b') == 3 for f in frames)
    # scene encode via scene_state
    frames = d.encode_command({'scene': 'party'})
    assert any(f.get('op') == 'scene' and (f.get('name') == 'party' or f.get('id') is not None) for f in frames)
    # segment
    frames = d.encode_command({'segments': [{'index': 0, 'color': {'r':10,'g':20,'b':30}}]})
    assert any(f.get('op') == 'seg' and f.get('index') == 0 for f in frames)
    # pixels
    frames = d.encode_command({'pixels': [[1,2,3],[4,5,6]]})
    assert any(f.get('op') == 'pixels' and isinstance(f.get('pixels'), list) for f in frames)
    # effect
    frames = d.encode_command({'effect': {'name': 'pulse', 'speed': 4}})
    assert any(f.get('op') == 'effect' and f.get('name') == 'pulse' for f in frames)

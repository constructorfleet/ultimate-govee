import asyncio
import types

import pytest

from govee.data.ble.decoder_lib import Decoder
from govee.data.ble.decoder_service import DecoderService


def test_unsupported_decoder_returns_none():
    # unsupported decoder name -> decode returns None
    res = Decoder.decode({'manufacturerData': 'abcd'}, ['unsupported_decoder', 'manufacturerdata', 0, 2, False, False])
    assert res is None


def test_decode_hex_string_invalid_characters():
    # malformed hex in manufacturerData should be handled gracefully (None)
    res = Decoder.decode({'manufacturerData': 'zzzz'}, ['value_from_hex_string', 'manufacturerdata', 0, 4, False, False])
    assert res is None


def test_decode_accepts_bytes_manufacturer_data():
    md_bytes = bytes.fromhex('88ec000418ee6400')
    md_str = md_bytes.hex()
    args = ['value_from_hex_string', 'manufacturerdata', 0, len(md_str), False, False]
    r_bytes = Decoder.decode({'manufacturerData': md_bytes}, args)
    r_str = Decoder.decode({'manufacturerData': md_str}, args)
    assert r_bytes == r_str


@pytest.mark.asyncio
async def test_spec_top_level_condition_blocks_spec(monkeypatch):
    svc = DecoderService()

    # monkeypatch _load_spec_from_dirs to return a spec with a top-level condition
    spec = {'properties': {}, 'condition': ['manufacturerdata', '=', 'NOPE']}

    def fake_load(model, dirs=None):
        return spec

    svc._load_spec_from_dirs = fake_load

    # peripheral has manufacturer_data that encodes a model token H123|
    peripheral = {'advertisement': {'manufacturer_data': b'H123|'}, 'address': 'AA:BB:CC:DD'}

    decoded = await svc.decode_device(peripheral)
    # spec's top-level condition should block application -> decode returns None
    assert decoded is None


@pytest.mark.asyncio
async def test_model_extraction_from_manufacturer_data_and_name(monkeypatch):
    svc = DecoderService()

    captured = []

    async def fake_get_device_spec(model):
        captured.append(model)
        return None

    svc.get_device_spec = fake_get_device_spec

    # case 1: manufacturer_data contains model
    p1 = {'advertisement': {'manufacturer_data': b'H123|'}}
    await svc.decode_device(p1)
    assert 'H123' in captured

    # case 2: name contains GVH... pattern
    captured.clear()
    p2 = {'advertisement': {}, 'advertisement': {'localName': 'GVH5106_2811'}}
    await svc.decode_device({'advertisement': {'localName': 'GVH5106_2811'}})
    assert 'GVH5106' in captured


@pytest.mark.asyncio
async def test_iot_manager_called_with_expected_device_info(monkeypatch):
    svc = DecoderService()

    # spec indicates iot_manager True
    spec = {'properties': {}, 'iot_manager': True}

    def fake_load(model, dirs=None):
        return spec

    svc._load_spec_from_dirs = fake_load

    captured = {}

    class FakeManager:
        async def decode(self, spec_arg, device_info):
            captured['spec'] = spec_arg
            captured['device'] = device_info
            return {'ok': True}

    svc.iot_manager = FakeManager()

    peripheral = {'advertisement': {'manufacturer_data': b'H999|'}, 'address': '11:22:33:44'}
    decoded = await svc.decode_device(peripheral)

    assert captured.get('spec') is spec
    # device info should contain keys as expected
    assert 'manufacturerData' in captured.get('device')
    assert 'name' in captured.get('device')
    assert 'macAddress' in captured.get('device')
    # And the decoded result should include model and properties from iot_manager
    assert decoded is not None
    assert decoded.get('model') == 'H999'
    assert decoded.get('properties') == {'ok': True}

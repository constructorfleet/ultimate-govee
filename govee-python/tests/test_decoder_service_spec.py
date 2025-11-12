import asyncio

from govee.data.ble.decoder_service import DecoderService


def test_spec_driven_decoding_with_mocked_spec():
    svc = DecoderService()

    # manufacture a payload: b'FOO|' + two bytes 0x00 0x41 (decimal 65)
    payload = b'FOO|' + bytes([0x00, 0x41])
    peripheral = {
        'id': '1',
        'address': 'AA:BB:CC:DD:EE:FF',
        'advertisement': {
            # Use a non-Govee name so the simple GoveeBleDecoder does not
            # short-circuit decoding and the spec-driven path is exercised.
            'localName': 'Other',
            'manufacturer_data': payload,
        },
    }

    # supply a minimal spec that decodes 'batt' from manufacturerdata at
    # hex-offset 8 (header 4 bytes -> 8 hex chars) length 4 (2 bytes -> 4 hex chars)
    spec = {
        'properties': {
            'batt': {
                'decoder': ['value_from_hex_string', 'manufacturerdata', 8, 4, False, False]
            }
        }
    }

    # monkeypatch the loader to return our spec for model 'FOO'
    original_loader = svc._load_spec_from_dirs

    def fake_loader(model: str, dirs=None):
        if model == 'FOO':
            return spec
        return None

    svc._load_spec_from_dirs = fake_loader

    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    # we expect the spec-driven path to populate properties
    props = res.get('properties')
    assert props is not None
    # decode_properties maps 'batt' -> 'battery'
    assert props.get('battery') == 65

    # restore loader
    svc._load_spec_from_dirs = original_loader


import asyncio
import json
from pathlib import Path

from govee.data.ble.decoder_service import DecoderService


def test_decode_h5179_fixture(tmp_path, monkeypatch):
    svc = DecoderService()
    spec_dir = tmp_path / 'specs'
    spec_dir.mkdir()
    fixture = Path('tests/fixtures/ble_specs/H5179.json').read_text()
    (spec_dir / 'H5179.json').write_text(fixture)

    def loader(model: str, dirs=None):
        return json.loads((spec_dir / 'H5179.json').read_text()) if model == 'H5179' else None

    monkeypatch.setattr(svc, '_load_spec_from_dirs', loader)

    # craft manufacturer data: ascii 'H5179|' + hex bytes where batt at offset 22 hex-digit offset
    md = b'H5179|' + bytes.fromhex('0102030405060708090A41')
    peripheral = {
        'id': 'p1',
        'address': 'AA:BB',
        'advertisement': {
            'localName': None,
            'manufacturer_data': md
        }
    }

    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    assert res.get('model') == 'H5179'
    props = res.get('properties', {})
    assert props.get('battery') == 65


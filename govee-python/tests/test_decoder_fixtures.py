import asyncio
from pathlib import Path
import json
from govee.data.ble.decoder_service import DecoderService


def test_decode_using_fixture_spec_file(tmp_path, monkeypatch):
    svc = DecoderService()
    # write the fixture spec to a temp dir and patch loader to use it
    spec_dir = tmp_path / 'specs'
    spec_dir.mkdir()
    fixture = Path('govee-python/tests/fixtures/ble_specs/HTEST.json').read_text()
    (spec_dir / 'HTEST.json').write_text(fixture)

    def loader(model: str, dirs=None):
        import json
        return json.loads((spec_dir / 'HTEST.json').read_text())

    monkeypatch.setattr(svc, '_load_spec_from_dirs', loader)

    # create a peripheral with manufacturer_data hex where batt at offset 6 is 0x41 and temp encoded -> 0x0BB8 (3000) => post_proc /100 -> 30.0
    # We'll craft manufacturer data accordingly: header 3 bytes (6 hex chars) then batt(1 byte) 0x41 then temp 2 bytes 0x0bb8
    md = b'HTEST|' + bytes([0x00, 0x41]) + bytes.fromhex('0bb8')
    peripheral = {
        'id': 'p1',
        'address': 'AA:BB',
        'advertisement': {
            'localName': 'Other',
            'manufacturer_data': md,
        }
    }

    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    props = res.get('properties', {})
    # battery should be 65
    assert props.get('battery') == 65
    assert abs(props.get('temperature', {}).get('current') - 30.0) < 1e-6


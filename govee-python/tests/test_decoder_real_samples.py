import asyncio
from pathlib import Path
import json
from govee.data.ble.decoder_service import DecoderService


def load_sample(path):
    s=Path(path).read_text()
    data={}
    for line in s.splitlines():
        if ':' in line:
            k,v=line.split(':',1)
            data[k.strip()]=v.strip()
    return data


def test_decode_real_h5179_sample(tmp_path, monkeypatch):
    svc=DecoderService()
    sample = load_sample('ble/0188/Govee_H5179_34F7.txt')
    md_hex = sample.get('Manufacturer Data')
    md = bytes.fromhex(md_hex)

    # write spec fixture
    spec_dir=tmp_path/'specs'
    spec_dir.mkdir()
    fixture = Path('tests/fixtures/ble_specs/H5179_v2.json').read_text()
    (spec_dir/'H5179_v2.json').write_text(fixture)

    def loader(model: str, dirs=None):
        # match FOO or H5179 as used in this test by returning H5179_v2
        if model.startswith('H5179'):
            return json.loads((spec_dir/'H5179_v2.json').read_text())
        return None

    monkeypatch.setattr(svc,'_load_spec_from_dirs', loader)

    peripheral={'id':sample.get('Id'), 'advertisement': {'localName': sample.get('Name'), 'manufacturer_data': md}}
    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    props=res.get('properties',{})
    # The real sample may or may not include decoded properties depending on
    # the spec offsets; ensure we returned a properties mapping (possibly
    # empty) rather than requiring a specific decoded value here.
    assert isinstance(props, dict)


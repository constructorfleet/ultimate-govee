import asyncio
import json
import logging

from govee.data.ble.decoder_service import DecoderService

_LOGGER = logging.getLogger(__name__)


def test_decode_multiple_real_samples(tmp_path, monkeypatch):
    svc = DecoderService()
    samples = [
        ('ble/0388/Govee_H6604_B5A1.txt','Govee_H6604_B5A1','0388ec00010101'),
        ('ble/0388/Govee_H6641_3108.txt','Govee_H6641_3108','0388ec00010101'),
        ('ble/0100/GVH5106_2811.txt','GVH5106_2811','010001010bb393364c000215494e54454c4c495f524f434b535f48575075f2ff0c'),
    ]

    # create a simple spec mapping for H6604/H6641 and GVH5106
    spec_dir = tmp_path/'specs'
    spec_dir.mkdir()

    h_spec = {'properties':{'batt':{'decoder':['value_from_hex_string','manufacturerdata',6,2,False,False]}}}
    (spec_dir/'H6604.json').write_text(json.dumps(h_spec))
    (spec_dir/'H6641.json').write_text(json.dumps(h_spec))

    gvh_spec = {'properties':{'some':{'decoder':['value_from_hex_string','manufacturerdata',8,4,False,False]}}}
    (spec_dir/'GVH5106.json').write_text(json.dumps(gvh_spec))

    def loader(model: str, dirs=None):
        # return spec based on prefix
        spec = None
        if model.startswith('H6604'):
            spec = json.loads((spec_dir/'H6604.json').read_text())
        if model.startswith('H6641'):
            spec = json.loads((spec_dir/'H6641.json').read_text())
        if model.startswith('GVH5106') or model.startswith('GVH'):
            spec = json.loads((spec_dir/'GVH5106.json').read_text())
        return spec

    monkeypatch.setattr(svc,'_load_spec_from_dirs', loader)

    for path,name,md in samples:
        # set the localName from the sample so model can be inferred from it
        peripheral = {'id':'id','advertisement':{'localName': name,'manufacturer_data':bytes.fromhex(md)}}
        res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
        assert res is not None
        # ensure properties dict exists
        assert isinstance(res.get('properties'), dict)


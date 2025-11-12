import asyncio

from govee.data.ble.decoder_service import DecoderService


def test_property_condition_blocks_decoding():
    svc = DecoderService()

    # payload with model 'BAR' and manufacturer data bytes 0x0f to exercise bit tests
    payload = b"BAR|" + bytes([0x0F])
    peripheral = {
        "id": "1",
        "address": "AA:BB:CC:DD:EE:FF",
        "advertisement": {
            "localName": "Other",
            "manufacturer_data": payload,
        },
    }

    # spec where property has a condition that checks a bit that is 0 -> should be skipped
    spec = {
        "condition": None,
        "properties": {
            "batt": {
                "condition": ["manufacturerdata", 0, "ZZ"],
                "decoder": [
                    "value_from_hex_string",
                    "manufacturerdata",
                    2,
                    2,
                    False,
                    False,
                ],
            }
        },
    }

    original_loader = svc._load_spec_from_dirs

    def fake_loader(model: str, dirs=None):
        if model == "BAR":
            return spec
        return None

    svc._load_spec_from_dirs = fake_loader

    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    assert "properties" in res
    # since the property condition didn't match, properties should be empty
    assert res["properties"] == {}

    svc._load_spec_from_dirs = original_loader

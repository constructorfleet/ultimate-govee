import asyncio

from govee.data.ble.decoder_service import DecoderService


def test_decode_device_without_name_returns_none():
    svc = DecoderService()
    peripheral = {"id": "1", "address": "AA:BB:CC"}
    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is None


def test_decode_device_parses_bytes_manufacturer_data():
    svc = DecoderService()
    peripheral = {
        "id": "1",
        "address": "AA:BB:CC:DD:EE:FF",
        "advertisement": {
            "localName": "Govee",
            "manufacturer_data": b"H6112|AA:BB:CC:DD:EE:FF",
        },
    }
    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    assert res.get("model") == "H6112"
    assert res.get("mac") == "AA:BB:CC:DD:EE:FF"


def test_decode_device_parses_hex_string_manufacturer_data():
    svc = DecoderService()
    raw = b"H6112|AA:BB:CC:DD:EE:FF"
    hexstr = raw.hex()
    peripheral = {
        "id": "1",
        "address": "AA:BB:CC:DD:EE:FF",
        "advertisement": {
            "localName": "Govee",
            "manufacturer_data": hexstr,
        },
    }
    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    assert res.get("model") == "H6112"
    assert res.get("mac") == "AA:BB:CC:DD:EE:FF"

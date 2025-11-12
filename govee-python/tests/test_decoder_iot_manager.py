import asyncio

from govee.data.ble.decoder_service import DecoderService


async def fake_iot_decode(spec, device_info):
    # simulate a complex decode result
    return {"battery": 99, "temperature": {"current": 22.5}}


def test_iot_manager_fallback(monkeypatch):
    svc = DecoderService()
    # spec indicates iot_manager usage
    spec = {"properties": {}, "iot_manager": True}

    # monkeypatch loader and iot_manager
    svc._load_spec_from_dirs = lambda model, dirs=None: spec

    class FakeManager:
        async def decode(self, s, d):
            return await fake_iot_decode(s, d)

    svc.iot_manager = FakeManager()

    peripheral = {
        "id": "1",
        "address": "AA:BB",
        "advertisement": {
            "localName": None,
            "manufacturer_data": b"FOO|",
        },
    }

    res = asyncio.get_event_loop().run_until_complete(svc.decode_device(peripheral))
    assert res is not None
    assert res["properties"]["battery"] == 99
    assert abs(res["properties"]["temperature"]["current"] - 22.5) < 1e-6

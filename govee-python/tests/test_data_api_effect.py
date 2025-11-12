import base64

import pytest

from govee.data.api.effect.models import LightEffect, rebuild_light_op_code
from govee.data.api.effect.service import GoveeEffectService


def test_rebuild_light_op_code_basic():
    raw = bytes([0x01, 0x02, 0x03, 0x04, 0x05])
    b64 = base64.b64encode(raw).decode().rstrip("=")
    builder = rebuild_light_op_code(0x1002, b64)
    assert callable(builder)
    frames = builder([0x10, 0x20])
    assert isinstance(frames, list)
    assert all(isinstance(f, list) for f in frames)
    # expect at least one frame with checksum
    assert any(len(f) >= 10 for f in frames)
    for f in frames:
        if len(f) >= 1:
            checksum = 0
            for b in f[:-1]:
                checksum ^= b
            assert checksum == f[-1]


@pytest.mark.asyncio
async def test_govee_effect_service_maps_response():
    class FakeReq:
        def __init__(self, resp):
            self._resp = resp

        async def get(self):
            return self._resp

    async def fake_factory(url, headers=None, payload=None):
        b64 = base64.b64encode(bytes([9, 8, 7, 6])).decode().rstrip("=")
        data = {"data": {"effects": [{"name": "Strobe", "id": 42, "opStr": b64}]}}
        return FakeReq(data)

    svc = GoveeEffectService(request=fake_factory)

    class Auth:
        token = "tok"

    effects = await svc.get_light_effects(Auth(), "M1", 1, "dev-1")
    assert isinstance(effects, list)
    assert len(effects) == 1
    e = effects[0]
    assert isinstance(e, LightEffect)
    assert e.name == "Strobe"
    assert e.id == 42

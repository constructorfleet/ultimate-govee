import base64

import pytest
from govee.data.api.diy.models import DiyEffect, rebuild_diy_op_code
from govee.data.api.diy.service import GoveeDiyService


def test_rebuild_diy_op_code_basic():
    # create a simple base64 payload
    raw = bytes([0x00, 0x10, 0x20, 0x30, 0x40])
    b64 = base64.b64encode(raw).decode().rstrip("=")
    builder = rebuild_diy_op_code(0x0201, b64)
    assert callable(builder)
    frames = builder([1, 2])
    # frames should be a list of opcode frames (lists of ints) and include
    # at least one frame of the expected minimum length. Verify checksum
    # (last byte is xor of previous bytes) for frames produced.
    assert isinstance(frames, list)
    assert all(isinstance(f, list) for f in frames)
    assert any(len(f) >= 20 for f in frames)
    # checksum validation for produced frames
    for f in frames:
        if len(f) >= 1:
            checksum = 0
            for b in f[:-1]:
                checksum ^= b
            assert checksum == f[-1]


@pytest.mark.asyncio
async def test_govee_diy_service_maps_response():
    class FakeReq:
        def __init__(self, resp):
            self._resp = resp

        async def get(self):
            return self._resp

    async def fake_factory(url, headers=None, payload=None):
        b64 = base64.b64encode(bytes([1, 2, 3, 4])).decode().rstrip("=")
        data = {
            "data": {
                "diys": {
                    "diyGroups": [
                        {
                            "diys": [
                                {
                                    "diyName": "Rainbow",
                                    "diyCode": 7,
                                    "effectType": 2,
                                    "effectStr": b64,
                                }
                            ]
                        }
                    ]
                }
            }
        }
        return FakeReq(data)

    svc = GoveeDiyService(request=fake_factory)

    class Auth:
        token = "tok"

    effects = await svc.get_diy_effects(Auth(), "M1", 1, "dev-1")
    assert isinstance(effects, list)
    assert len(effects) == 1
    e = effects[0]
    assert isinstance(e, DiyEffect)
    assert e.name == "Rainbow"
    assert e.code == 7

import pytest

from govee.data.api.diy.service import GoveeDiyService


@pytest.mark.asyncio
async def test_get_one_clicks_parses_components():
    class FakeReq:
        def __init__(self, resp):
            self._resp = resp

        async def get(self):
            return self._resp

    async def fake_factory(url, headers=None, payload=None):
        data = {
            "data": {
                "componentData": {
                    "components": [
                        {"oneClicks": [{"name": "Oc1", "type": 1}]},
                        {"other": True},
                    ]
                }
            }
        }
        return FakeReq(data)

    svc = GoveeDiyService(request=fake_factory)

    class Auth:
        token = "tok"

    res = await svc.get_one_clicks(Auth())
    assert isinstance(res, list)
    assert len(res) == 1
    assert res[0].name == "Oc1"

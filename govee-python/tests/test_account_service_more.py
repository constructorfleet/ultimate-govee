import asyncio
import base64
import json
import time

from govee.data.api.account.models import OAuthData
from govee.data.api.account.service import GoveeAccountService


def make_jwt(payload: dict) -> str:
    b = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().strip("=")
    return f"hdr.{b}.sig"


class StubPersist:
    def __init__(self):
        self.saved = None

    def save(self, obj):
        self.saved = obj

    def load(self):
        return None


def test_refresh_called_and_returns_new_oauth():
    calls = {"refresh": 0}

    def fake_request(url, headers=None, payload=None):
        class _Req:
            async def get(self):
                if "refresh-tokens" in url:
                    calls["refresh"] += 1
                    return {
                        "data": {"token": "refreshed", "refreshToken": "r2", "tokenExpireCycle": 60}
                    }
                return {}

            async def post(self):
                return {}

        return _Req()

    svc = GoveeAccountService(persist=StubPersist(), request=fake_request)
    oauth = OAuthData(accessToken="old", refreshToken="r", clientId="cid", expiresAt=int(time.time()))
    new = asyncio.run(svc.refresh(oauth))
    assert new.accessToken == "refreshed"
    assert calls["refresh"] == 1


def test_legacy_request_wrapping_works():
    # legacy style function that expects method kwarg
    def legacy(url, headers=None, json=None, method="GET"):
        return {"data": {"client": {"accountId": "a1", "clientId": "c1", "topic": "t1", "accessToken": "x.y.z", "refreshToken": "r", "tokenExpireCycle": 10}}}

    svc = GoveeAccountService(persist=StubPersist(), request=legacy)
    acc = asyncio.run(svc.authenticate({"username": "u", "password": "p", "clientId": "c"}))
    assert acc.accountId == "a1"


def test_factory_style_request_object_used():
    # factory style returns object with get/post methods
    def factory(url, headers=None, payload=None):
        class Req:
            def __init__(self, url):
                self._url = url

            async def post(self):
                return {"data": {"client": {"accountId": "ff", "clientId": "cc", "topic": "t", "accessToken": "a.b.c", "refreshToken": "r", "tokenExpireCycle": 10}}}

            async def get(self):
                return {"data": {"community": {"token": "tok", "expiresAt": int(time.time() * 1000) + 1000}}}

        return Req(url)

    svc = GoveeAccountService(persist=StubPersist(), request=factory)
    acc = asyncio.run(svc.authenticate({"username": "u", "password": "p", "clientId": "c"}))
    assert acc.accountId == "ff"

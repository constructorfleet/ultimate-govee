import time

from govee.data.api.account.models import OAuthData
from govee.data.api.account.service import GoveeAccountService


def fake_request(url, headers=None, json=None, method="GET", auth=None):
    # Provide canned responses for the URLs the service calls.
    if "login" in url:
        return {
            "data": {
                "client": {
                    "accountId": "acct-1",
                    "clientId": "client-x",
                    "topic": "govee/topic/1",
                    "accessToken": "abc.def.ghi",
                    "refreshToken": "r1",
                    "tokenExpireCycle": 3600,
                }
            }
        }
    if "iot" in url:
        return {
            "data": {"p12": "p12data", "p12Pass": "pass", "endpoint": "iot.example.com"}
        }
    if "refresh-tokens" in url:
        return {
            "data": {
                "token": "newtoken",
                "refreshToken": "newref",
                "tokenExpireCycle": 3600,
            }
        }
    if "community-api" in url or "community" in url:
        return {
            "data": {
                "community": {
                    "token": "bff.token",
                    "expiresAt": int(time.time() * 1000) + 5000,
                }
            }
        }
    return {}


def fake_parse_p12(p12, p12pass):
    # return keys expected by service
    return {"certificate": "cert-pem", "privateKey": "key-pem"}


def test_is_token_valid():
    svc = GoveeAccountService(request=fake_request)
    # no token
    assert svc.is_token_valid(None) is False
    # malformed token
    assert svc.is_token_valid("not-a-token") is False

    # construct a fake JWT with exp in future
    import base64
    import json

    payload = {"iat": int(time.time()), "exp": int(time.time()) + 1000}
    b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().strip("=")
    token = f"hdr.{b64}.sig"
    assert svc.is_token_valid(token) is True


def test_authenticate_flow():
    # Create a tiny in-memory persist stub compatible with PersistService API
    class StubPersist:
        def __init__(self):
            self.stored = None

        def save(self, obj):
            self.stored = obj

        def load(self):
            return None

    svc = GoveeAccountService(
        persist=StubPersist(), request=fake_request, parse_p12=fake_parse_p12
    )
    import asyncio

    account = asyncio.run(
        svc.authenticate({"username": "u", "password": "p", "clientId": "c"})
    )
    assert account.accountId == "acct-1"
    assert account.clientId == "client-x"
    assert account.oauth is not None
    assert account.iot is not None
    assert account.bffOAuth is not None


def test_refresh_uses_request():
    svc = GoveeAccountService(request=fake_request)
    import asyncio

    oauth = OAuthData(
        accessToken="a",
        refreshToken="r",
        clientId="c",
        expiresAt=int(time.time() * 1000),
    )
    new = asyncio.run(svc.refresh(oauth))
    assert new.accessToken == "newtoken"

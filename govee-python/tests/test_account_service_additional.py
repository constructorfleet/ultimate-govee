import asyncio
import base64
import json
import time

from govee.data.api.account.models import GoveeAccount, IoTData, OAuthData
from govee.data.api.account.service import GoveeAccountService


def make_jwt_payload(payload: dict) -> str:
    b = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().strip("=")
    return f"h.{b}.s"


def test_models_dataclasses_basic():
    oauth = OAuthData(accessToken="a", refreshToken="r", clientId="c", expiresAt=123)
    iot = IoTData(
        certificate="cert",
        privateKey="key",
        endpoint="ep",
        accountId="acct",
        clientId="cid",
        topic="t",
    )
    acc = GoveeAccount(accountId="a1", clientId="c1", topic="t1", iot=iot, oauth=oauth)
    assert acc.accountId == "a1"
    assert acc.iot.clientId == "cid"


def test_jwt_decode_missing_fields_returns_false():
    svc = GoveeAccountService(request=lambda *a, **k: {})
    # payload missing exp
    payload = {"iat": int(time.time())}
    token = make_jwt_payload(payload)
    assert svc.is_token_valid(token) is False


def test_service_init_loads_persisted_data():
    persisted = {
        "accountId": "acct-load",
        "clientId": "client-load",
        "topic": "topic-load",
        "oauth": {
            "accessToken": "a",
            "refreshToken": "r",
            "clientId": "client-load",
            "expiresAt": 9999,
        },
        "bffOAuth": {
            "accessToken": "b",
            "refreshToken": "",
            "clientId": "client-load",
            "expiresAt": 9999,
        },
        "iot": {
            "certificate": "c",
            "privateKey": "k",
            "endpoint": "ep",
            "accountId": "acct-load",
            "clientId": "client-load",
            "topic": "topic-load",
        },
    }

    class StubPersist:
        def load(self):
            return persisted

        def save(self, obj):
            raise AssertionError("save should not be called during init")

    svc = GoveeAccountService(persist=StubPersist(), request=lambda *a, **k: {})
    # inspect private account mapping populated from persisted dict
    acc = svc._account
    assert acc.accountId == "acct-load"
    assert acc.clientId == "client-load"
    assert acc.iot is not None


def test_authenticate_uses_persisted_and_skips_requests():
    # create valid JWT for oauth and bffOAuth with future exp
    future = int(time.time()) + 10000
    tok = make_jwt_payload({"iat": int(time.time()), "exp": future})

    persisted = {
        "accountId": "acct-p",
        "clientId": "client-p",
        "topic": "t-p",
        "oauth": {
            "accessToken": tok,
            "refreshToken": "r",
            "clientId": "client-p",
            "expiresAt": 9999,
        },
        "bffOAuth": {
            "accessToken": tok,
            "refreshToken": "",
            "clientId": "client-p",
            "expiresAt": future,
        },
    }

    class StubPersist:
        def __init__(self):
            self.saved = None

        def load(self):
            return persisted

        def save(self, obj):
            # should not be called because tokens are valid
            raise AssertionError(
                "save should not be called when using persisted valid tokens"
            )

    def bad_request(*a, **k):
        raise AssertionError(
            "request should not be called when persisted tokens are valid"
        )

    svc = GoveeAccountService(persist=StubPersist(), request=bad_request)
    # should not raise despite request being a bad function because authenticate
    # should short-circuit using persisted tokens
    acc = asyncio.run(svc.authenticate({"username": "u", "password": "p"}))
    assert acc.accountId == "acct-p"


def test_authenticate_without_parse_p12_leaves_iot_none():
    # fake_request returns dicts for the calls
    def fake_request(url, headers=None, payload=None):
        class _Req:
            def __init__(self, resp):
                self._resp = resp

            async def post(self):
                return self._resp

            async def get(self):
                return self._resp

        if "login" in url:
            return _Req(
                {
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
            )
        if "iot" in url:
            return _Req(
                {
                    "data": {
                        "p12": "p12data",
                        "p12Pass": "pass",
                        "endpoint": "iot.example.com",
                    }
                }
            )
        if "community" in url:
            return _Req(
                {
                    "data": {
                        "community": {
                            "token": "bff.token",
                            "expiresAt": int(time.time() * 1000) + 5000,
                        }
                    }
                }
            )
        return _Req({})

    class StubPersist:
        def __init__(self):
            self.saved = None

        def save(self, obj):
            self.saved = obj

        def load(self):
            return None

    svc = GoveeAccountService(
        persist=StubPersist(), request=fake_request, parse_p12=None
    )
    acc = asyncio.run(
        svc.authenticate({"username": "u", "password": "p", "clientId": "c"})
    )
    # because parse_p12 is None the service should not populate iot
    assert acc.iot is None

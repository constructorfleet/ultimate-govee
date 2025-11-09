from govee.data.api.account import jwt
from govee.data.api.account.login_response import LoginResponse, CommunityLoginResponse
from govee.data.api.account.refresh_token_response import RefreshTokenResponse
from govee.data.api.account.iot_certificate_response import IoTCertificateResponse
import base64
import json
import time


def make_jwt_payload(payload: dict) -> str:
    b = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().strip("=")
    return f"h.{b}.s"


def test_decode_jwt_valid_and_invalid():
    assert jwt.decode_jwt(None) is None
    assert jwt.decode_jwt("notjwt") is None
    payload = {"iat": int(time.time()), "exp": int(time.time()) + 1000}
    token = make_jwt_payload(payload)
    decoded = jwt.decode_jwt(token)
    assert decoded is not None
    assert decoded.get("iat") == payload["iat"]


def test_login_response_from_dict():
    d = {"client": {"topic": "t", "token": "at", "refreshToken": "rt", "tokenExpireCycle": 100, "client": "cid", "accountId": 123}}
    lr = LoginResponse.from_dict(d)
    assert lr.client.topic == "t"
    assert lr.client.accessToken == "at"
    assert lr.client.clientId == "cid"
    assert lr.client.accountId == "123"


def test_community_login_response():
    d = {"data": {"token": "btok", "expiredAt": 9999, "id": 55}}
    cr = CommunityLoginResponse.from_dict(d)
    assert cr.community.token == "btok"
    assert cr.community.expiresAt == 9999
    assert cr.community.accountId == "55"


def test_refresh_token_response():
    d = {"data": {"refreshToken": "r1", "token": "t1", "tokenExpireCycle": 3600}}
    rr = RefreshTokenResponse.from_dict(d)
    assert rr.data.token == "t1"
    assert rr.data.refreshToken == "r1"


def test_iot_certificate_response():
    d = {"data": {"brokerUrl": "b", "p12": "p12dat", "p12Pass": "pass"}}
    ir = IoTCertificateResponse.from_dict(d)
    assert ir.iotData.brokerUrl == "b"
    assert ir.iotData.p12Certificate == "p12dat"


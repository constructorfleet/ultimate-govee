from govee.data.api.account.login_response import (
    ClientData,
    LoginResponse,
    CommunityAuth,
    CommunityLoginResponse,
)


def test_clientdata_from_dict_with_alternate_keys_and_types():
    # realistic payload where some services use alternate key names
    payload = {
        "topic": "user/123/topic",
        "token": "access.token.value",
        "refreshToken": "refresh.token.value",
        "tokenExpireCycle": "3600",  # sometimes sent as string
        "client": "client-xyz",
        "accountId": 987654321,
    }

    cd = ClientData.from_dict(payload)

    assert cd.topic == "user/123/topic"
    # accessToken falls back to `token`
    assert cd.accessToken == "access.token.value"
    assert cd.refreshToken == "refresh.token.value"
    # numeric string converted to int
    assert isinstance(cd.tokenExpireCycle, int)
    assert cd.tokenExpireCycle == 3600
    # clientId falls back to `client`
    assert cd.clientId == "client-xyz"
    # accountId converted to string
    assert cd.accountId == "987654321"


def test_loginresponse_from_dict_defaults_when_missing_client():
    # server might return an empty dict for client; ensure defaults are sane
    data = {}
    lr = LoginResponse.from_dict(data)

    # client should be present and its fields defaulted
    assert isinstance(lr.client, ClientData)
    assert lr.client.topic == ""
    assert lr.client.accessToken == ""
    assert lr.client.refreshToken == ""
    assert lr.client.tokenExpireCycle == 0
    assert lr.client.clientId == ""
    assert lr.client.accountId == ""


def test_communityauth_from_dict_with_alternate_keys_and_optional_fields():
    # realistic community login response with mixed keys
    payload = {
        "token": "community-token-abc",
        "headerUrl": "https://example.com/avatar.png",
        "nickname": "gary",
        "id": 42,
        "expiredAt": "1670000000",
        "email": "gary@example.com",
    }

    ca = CommunityAuth.from_dict(payload)

    assert ca.token == "community-token-abc"
    assert ca.headerUrl == "https://example.com/avatar.png"
    assert ca.nickName == "gary"
    # id is coerced to string
    assert ca.accountId == "42"
    # expiredAt string converted to int
    assert isinstance(ca.expiresAt, int)
    assert ca.expiresAt == 1670000000
    assert ca.emailAddress == "gary@example.com"


def test_communityloginresponse_from_dict_pulls_data_key():
    # outer response wraps the community data under `data`
    response = {"data": {"token": "x", "id": "7", "expiresAt": 123}}
    clr = CommunityLoginResponse.from_dict(response)

    assert isinstance(clr.community, CommunityAuth)
    assert clr.community.token == "x"
    assert clr.community.accountId == "7"
    assert clr.community.expiresAt == 123

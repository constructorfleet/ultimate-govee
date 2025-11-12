"""Tests for govee.data.api.account.refresh_token_response.

These use realistic-like payloads to ensure from_dict coercions and defaults
behave as expected.
"""

from govee.data.api.account.refresh_token_response import (
    RefreshTokenData, RefreshTokenResponse)


def test_refresh_token_data_from_dict_with_string_numeric_expiration():
    payload = {
        "refreshToken": "refresh.token.value",
        "token": "access.token.value",
        # some services send numbers as strings
        "tokenExpireCycle": "7200",
    }

    rd = RefreshTokenData.from_dict(payload)

    assert rd.refreshToken == "refresh.token.value"
    assert rd.token == "access.token.value"
    assert isinstance(rd.tokenExpireCycle, int)
    assert rd.tokenExpireCycle == 7200


def test_refresh_token_response_from_dict_with_missing_data_key_uses_defaults():
    # server might respond with an empty body for data
    resp = RefreshTokenResponse.from_dict({})

    assert isinstance(resp.data, RefreshTokenData)
    # defaults should be empty strings and zero
    assert resp.data.refreshToken == ""
    assert resp.data.token == ""
    assert resp.data.tokenExpireCycle == 0


def test_refresh_token_data_from_dict_handles_float_and_ignores_extra_keys():
    payload = {
        "refreshToken": "rt-xyz",
        "token": "t-abc",
        "tokenExpireCycle": 3600.9,  # float should be coerced to int
        "extra": "should be ignored",
    }

    rd = RefreshTokenData.from_dict(payload)

    assert rd.refreshToken == "rt-xyz"
    assert rd.token == "t-abc"
    # int(3600.9) -> 3600
    assert rd.tokenExpireCycle == 3600

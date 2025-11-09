"""Tests for govee.data.api.account.models dataclasses.

These tests exercise simple construction, default values, and nested
assignments using realistic sample values so higher-level services can rely on
the shapes.
"""

from __future__ import annotations

from govee.data.api.account import models


def test_oauthdata_fields_and_equality():
    oa = models.OAuthData(
        accessToken="ya29.A0ARrdaM-sample-access",
        refreshToken="1//0g_sample_refresh",
        clientId="client-123",
        expiresAt=1700000000,
    )

    assert oa.accessToken.startswith("ya29")
    assert oa.refreshToken.startswith("1//0g_")
    assert oa.clientId == "client-123"
    assert isinstance(oa.expiresAt, int) and oa.expiresAt > 1600000000

    # dataclasses provide equality by value
    oa2 = models.OAuthData(
        accessToken="ya29.A0ARrdaM-sample-access",
        refreshToken="1//0g_sample_refresh",
        clientId="client-123",
        expiresAt=1700000000,
    )
    assert oa == oa2


def test_iotdata_fields_and_repr():
    iot = models.IoTData(
        certificate="-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----",
        privateKey="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----",
        endpoint="a1b2c3d4e5-ats.iot.us-west-2.amazonaws.com",
        accountId="acct-987",
        clientId="iot-client-42",
        topic="govee/dev/updates",
    )

    assert "CERTIFICATE" in iot.certificate
    assert iot.endpoint.endswith("amazonaws.com")
    assert iot.accountId == "acct-987"
    assert iot.topic.startswith("govee/")

    # ensure repr doesn't raise and contains the class name
    r = repr(iot)
    assert "IoTData" in r


def test_goveeaccount_defaults_and_nested():
    # default construction yields empty strings and None for optional fields
    ga = models.GoveeAccount()
    assert ga.accountId == ""
    assert ga.clientId == ""
    assert ga.topic == ""
    assert ga.iot is None
    assert ga.oauth is None

    # populate nested fields with realistic values
    ga.accountId = "42"
    ga.clientId = "client-42"
    ga.topic = "govee/home/livingroom"
    ga.oauth = models.OAuthData(
        accessToken="access-xyz",
        refreshToken="refresh-xyz",
        clientId="client-42",
        expiresAt=1710000000,
    )
    ga.iot = models.IoTData(
        certificate="cert",
        privateKey="key",
        endpoint="endpoint",
        accountId=ga.accountId,
        clientId=ga.clientId,
        topic=ga.topic,
    )

    assert ga.oauth.clientId == ga.clientId
    assert ga.iot.accountId == "42"


def test_goveeaccount_optional_bff_oauth():
    # verify that bffOAuth can be independently set
    ga = models.GoveeAccount(accountId="100")
    ga.bffOAuth = models.OAuthData(
        accessToken="bff-at",
        refreshToken="bff-rt",
        clientId="bff-client",
        expiresAt=1800000000,
    )

    assert ga.bffOAuth is not None
    assert ga.bffOAuth.clientId == "bff-client"

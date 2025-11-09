from govee.data.api.account import configuration


def test_constants_are_set():
    assert configuration.AUTH_URL.startswith("https://")
    assert configuration.COMMUNITY_AUTH_URL.startswith("https://")
    assert configuration.REFRESH_TOKEN_URL.startswith("https://")
    assert configuration.IOT_CERT_URL.startswith("https://")


def test_govee_headers_defaults_and_overrides():
    # default values when nothing passed
    h = configuration.govee_headers()
    assert h["x-govee-client-id"] == ""
    assert h["x-govee-client-type"] == "1"

    # explicit client id and client type
    h2 = configuration.govee_headers(client_id="my-client", client_type="2")
    assert h2["x-govee-client-id"] == "my-client"
    assert h2["x-govee-client-type"] == "2"


def test_govee_authenticated_headers_with_oauth():
    oauth = {"clientId": "abc123", "accessToken": "tok-val"}
    headers = configuration.govee_authenticated_headers(oauth)
    # preserves x-govee-client-id from oauth clientId
    assert headers["x-govee-client-id"] == "abc123"
    # Authorization should be Bearer <token>
    assert headers["Authorization"] == "Bearer tok-val"
    # default client_type is '1'
    assert headers["x-govee-client-type"] == "1"

    # missing accessToken should still provide Authorization key with empty token
    oauth2 = {"clientId": "c2"}
    headers2 = configuration.govee_authenticated_headers(oauth2, client_type="5")
    assert headers2["x-govee-client-id"] == "c2"
    assert headers2["x-govee-client-type"] == "5"
    assert headers2["Authorization"] == "Bearer "

from govee.domain.auth.service import AuthService
from govee.domain.auth.types import AuthCredentials


def test_login_sets_token_and_state():
    svc = AuthService()
    creds = AuthCredentials(username="bob", password="secret")
    token = svc.login(creds)
    assert token == "token-bob"
    assert svc.state.logged_in is True
    assert svc.state.token == token


def test_login_rejects_empty_credentials():
    svc = AuthService()
    creds = AuthCredentials(username="", password="")
    try:
        svc.login(creds)
        assert False, "expected ValueError"
    except ValueError:
        pass

from govee.types import Credentials, resolve_label


def test_credentials_dataclass():
    c = Credentials(username="u", password="p", client_id="cid")
    assert c.username == "u"
    assert c.password == "p"
    assert c.client_id == "cid"


def test_resolve_label():
    assert resolve_label("simple") == "simple"
    assert resolve_label(lambda: "computed") == "computed"


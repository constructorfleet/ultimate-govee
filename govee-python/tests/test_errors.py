from govee import GoveeError


def test_govee_error_message():
    e = GoveeError("something went wrong")
    assert "Govee" in str(e)

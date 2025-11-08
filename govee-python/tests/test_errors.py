import pytest

from govee.errors import GoveeError, GoveeApiError, GoveeCommunityApiError


def test_govee_error_message():
    e = GoveeError("boom")
    assert "boom" in str(e)


def test_api_errors():
    assert "Govee" in str(GoveeApiError("a"))
    assert "GoveeCommunity" in str(GoveeCommunityApiError("b"))


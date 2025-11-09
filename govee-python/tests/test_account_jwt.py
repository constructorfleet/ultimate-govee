import base64
import json

import pytest

from govee.data.api.account.jwt import decode_jwt


def make_jwt_payload(obj: dict) -> str:
    """Create a fake JWT with a given payload dict.

    We only need a header, payload, and signature sections. The payload is
    urlsafe-base64 encoded without padding (as is common in JWTs).
    """
    payload_b = base64.urlsafe_b64encode(json.dumps(obj).encode()).decode()
    payload_b = payload_b.rstrip("=")
    return f"hdr.{payload_b}.sig"


def test_decode_none_returns_none():
    assert decode_jwt(None) is None


def test_decode_empty_string_returns_none():
    assert decode_jwt("") is None


def test_decode_invalid_format_returns_none():
    # Missing dots
    assert decode_jwt("not-a-jwt") is None


def test_decode_malformed_base64_returns_none():
    # Payload part is not valid base64
    token = "hdr.not_base64!.sig"
    assert decode_jwt(token) is None


def test_decode_valid_payload():
    payload = {"sub": "123", "name": "Alice", "admin": False}
    token = make_jwt_payload(payload)
    decoded = decode_jwt(token)
    assert isinstance(decoded, dict)
    # json will load booleans/literals accordingly
    assert decoded == payload


def test_decode_payload_with_padding_needed():
    # Craft a payload whose base64 length would require padding characters
    # after stripping to simulate typical jwt without padding.
    payload = {"k": "v"}
    token = make_jwt_payload(payload)
    # Ensure the implementation can handle adding padding back
    assert decode_jwt(token) == payload


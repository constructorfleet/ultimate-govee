"""Configuration helpers for account API (minimal port).

This exposes constants/functional helpers similar to the TypeScript
configuration used by the NestJS module. Tests and services will import the
values directly as needed.
"""
from __future__ import annotations

from typing import Dict


AUTH_URL = "https://app2.govee.com/account/rest/account/v1/login"
COMMUNITY_AUTH_URL = "https://community-api.govee.com/os/v1/login"
REFRESH_TOKEN_URL = "https://app2.govee.com/account/rest/v1/first/refresh-tokens"
IOT_CERT_URL = "https://app2.govee.com/app/v1/account/iot/key"


def govee_headers(client_id: str = "", client_type: str = "1") -> Dict[str, str]:
    return {"x-govee-client-id": client_id, "x-govee-client-type": client_type}


def govee_authenticated_headers(oauth: Dict[str, str], client_type: str = "1") -> Dict[str, str]:
    headers = govee_headers(oauth.get("clientId", ""), client_type)
    headers["Authorization"] = f"Bearer {oauth.get('accessToken', '')}"
    return headers

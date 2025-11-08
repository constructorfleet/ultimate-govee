"""Models for account API ported from lib/data/api/account/models.

Keep lightweight dataclasses suitable for the translated Python package and
for tests that verify higher-level services that depend on these shapes.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class OAuthData:
    accessToken: str
    refreshToken: str
    clientId: str
    expiresAt: int


@dataclass
class IoTData:
    certificate: str
    privateKey: str
    endpoint: str
    accountId: str
    clientId: str
    topic: str


@dataclass
class GoveeAccount:
    accountId: str = ""
    clientId: str = ""
    topic: str = ""
    iot: Optional[IoTData] = None
    oauth: Optional[OAuthData] = None
    bffOAuth: Optional[OAuthData] = None

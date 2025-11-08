"""Login response model for account API (lightweight from_dict helpers)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class ClientData:
    topic: str
    accessToken: str
    refreshToken: str
    tokenExpireCycle: int
    clientId: str
    accountId: str

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "ClientData":
        return ClientData(
            topic=d.get("topic", ""),
            accessToken=d.get("accessToken", d.get("token", "")),
            refreshToken=d.get("refreshToken", ""),
            tokenExpireCycle=int(d.get("tokenExpireCycle", 0)),
            clientId=d.get("clientId", d.get("client", "")),
            accountId=str(d.get("accountId", "")),
        )


@dataclass
class LoginResponse:
    client: ClientData

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "LoginResponse":
        return LoginResponse(client=ClientData.from_dict(d.get("client", {})))


@dataclass
class CommunityAuth:
    token: str
    headerUrl: Optional[str]
    nickName: Optional[str]
    accountId: str
    expiresAt: int
    emailAddress: Optional[str]

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "CommunityAuth":
        return CommunityAuth(
            token=d.get("token", ""),
            headerUrl=d.get("headerUrl"),
            nickName=d.get("nickname"),
            accountId=str(d.get("id", d.get("accountId", ""))),
            expiresAt=int(d.get("expiredAt", d.get("expiresAt", 0))),
            emailAddress=d.get("email"),
        )


@dataclass
class CommunityLoginResponse:
    community: CommunityAuth

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "CommunityLoginResponse":
        return CommunityLoginResponse(community=CommunityAuth.from_dict(d.get("data", {})))

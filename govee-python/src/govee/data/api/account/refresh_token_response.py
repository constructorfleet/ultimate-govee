"""Refresh token response model."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class RefreshTokenData:
    refreshToken: str
    token: str
    tokenExpireCycle: int

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "RefreshTokenData":
        return RefreshTokenData(
            refreshToken=d.get("refreshToken", ""),
            token=d.get("token", ""),
            tokenExpireCycle=int(d.get("tokenExpireCycle", 0)),
        )


@dataclass
class RefreshTokenResponse:
    data: RefreshTokenData

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "RefreshTokenResponse":
        return RefreshTokenResponse(data=RefreshTokenData.from_dict(d.get("data", {})))

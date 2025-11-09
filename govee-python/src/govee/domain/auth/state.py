"""Auth state minimal implementation for unit tests."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class AuthState:
    logged_in: bool = False
    token: Optional[str] = None

    def apply_token(self, token: str) -> None:
        self.token = token
        self.logged_in = True

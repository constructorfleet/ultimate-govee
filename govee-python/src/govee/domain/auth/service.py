"""Auth service minimal translation for tests."""

from __future__ import annotations

from .state import AuthState
from .types import AuthCredentials


class AuthService:
    def __init__(self) -> None:
        self.state = AuthState()

    def login(self, creds: AuthCredentials) -> str:
        # minimal behaviour: accept any non-empty username/password and
        # return a fake token.
        if not creds.username or not creds.password:
            raise ValueError("invalid credentials")
        token = f"token-{creds.username}"
        self.state.apply_token(token)
        return token

    def logout(self) -> None:
        self.state = AuthState()

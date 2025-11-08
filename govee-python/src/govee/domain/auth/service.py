"""Auth service minimal translation for tests."""
from __future__ import annotations

from .types import AuthCredentials
from .state import AuthState


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


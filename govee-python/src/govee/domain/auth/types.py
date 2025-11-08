"""Auth types minimal translation for tests."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class AuthCredentials:
    username: str
    password: str
    token: Optional[str] = None



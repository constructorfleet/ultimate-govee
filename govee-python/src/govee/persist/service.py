"""Minimal persist service used by tests to read/write JSON files."""
from __future__ import annotations

import json
from typing import Any


class PersistService:
    def __init__(self, path: str = "./data.json") -> None:
        self.path = path

    def save(self, obj: Any) -> None:
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(obj, f)

    def load(self) -> Any:
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return None


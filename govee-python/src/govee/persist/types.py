"""Persist layer types minimal for tests."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PersistOptions:
    path: str = "./data.json"

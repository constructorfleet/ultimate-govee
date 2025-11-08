"""Minimal observer pattern used in tests to avoid rxjs dependency."""
from __future__ import annotations

from typing import Callable, List, Any


class Subject:
    def __init__(self) -> None:
        self._subs: List[Callable[[Any], None]] = []

    def subscribe(self, fn: Callable[[Any], None]) -> None:
        self._subs.append(fn)

    def next(self, value: Any) -> None:
        for s in list(self._subs):
            s(value)


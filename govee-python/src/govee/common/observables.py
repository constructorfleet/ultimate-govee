"""Minimal observer pattern used in tests to avoid rxjs dependency."""
from __future__ import annotations

from typing import Callable, List, Any, Dict
from .delta_types import MapDelta


class Subject:
    def __init__(self) -> None:
        self._subs: List[Callable[[Any], None]] = []

    def subscribe(self, fn: Callable[[Any], None]) -> None:
        self._subs.append(fn)

    def next(self, value: Any) -> None:
        for s in list(self._subs):
            s(value)



class DeltaSubject(Subject):
    """A simple Subject that tracks map delta values."""

    def __init__(self) -> None:
        super().__init__()
        self._last: Dict[Any, Any] = {}

    def next_delta(self, delta: MapDelta) -> None:
        # In real implementation we'd merge and compute; tests only need shape
        for s in list(self._subs):
            s(delta)

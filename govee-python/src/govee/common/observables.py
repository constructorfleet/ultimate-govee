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
        """Accept a MapDelta and forward it to subscribers.

        Additionally update an internal map of the last seen values so
        consumers can query the current merged map via `last()`.
        """
        # merge the incoming delta into our local 'last' map
        # note: shallow copy is sufficient for tests
        merged = dict(self._last)
        # apply deletions
        for k in delta.deleted.keys():
            if k in merged:
                del merged[k]
        # apply additions and modifications
        for k, v in {**delta.added, **delta.modified}.items():
            merged[k] = v

        self._last = merged

        for s in list(self._subs):
            s(delta)

    def last(self) -> Dict[Any, Any]:
        """Return the current merged map of values."""
        return dict(self._last)

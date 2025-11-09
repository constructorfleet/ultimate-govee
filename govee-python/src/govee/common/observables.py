"""Minimal observer pattern used in tests to avoid rxjs dependency."""

from __future__ import annotations

from typing import Any, Callable, Dict, List

from .delta_types import MapDelta


class Subject:
    def __init__(self) -> None:
        self._subs: List[Callable[[Any], None]] = []

    def subscribe(self, fn: Callable[[Any], None]) -> None:
        self._subs.append(fn)

        # return a simple unsubscribe function for convenience
        def unsubscribe():
            try:
                self._subs.remove(fn)
            except ValueError:
                pass

        return unsubscribe

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

    @property
    def observed(self) -> bool:
        """Compatibility alias: whether there are subscribers."""
        return bool(self._subs)

    def last(self) -> Dict[Any, Any]:
        """Return the current merged map of values."""
        return dict(self._last)


class ForwardBehaviorSubject(Subject):
    """A Subject that holds a current value but does not emit it to new
    subscribers. Emissions are forwarded only for future next() calls.
    """

    def __init__(self, value: Any) -> None:
        super().__init__()
        self._value = value

    def get_value(self) -> Any:
        return self._value

    # TypeScript-compatible alias
    def getValue(self) -> Any:
        return self.get_value()

    def next(self, value: Any) -> None:
        self._value = value
        super().next(value)


class PartialBehaviorSubject(ForwardBehaviorSubject):
    """A Behavior-like subject that supports publishing partial updates
    (dictionaries) to a `partial` stream while updating the full value.
    """

    def __init__(self, initial: Any) -> None:
        super().__init__(initial)
        self._partial_subs: List[Callable[[Any], None]] = []

    def partial_subscribe(self, fn: Callable[[Any], None]):
        self._partial_subs.append(fn)

        def unsubscribe():
            try:
                self._partial_subs.remove(fn)
            except ValueError:
                pass

        return unsubscribe

    def partial_next(self, value: dict) -> None:
        # Only notify partial subscribers for dict-like partial updates.
        if isinstance(value, dict):
            for s in list(self._partial_subs):
                s(value)

            # merge into current value if it's a dict-like
            current = self.get_value()
            if isinstance(current, dict):
                merged = dict(current)
                merged.update(value)
                self.next(merged)
            else:
                # fallback: replace
                self.next(value)
        else:
            # Non-dict partials are treated as full replacements and only
            # forwarded to full-value subscribers via next(). Partial
            # subscribers are not notified since they expect dict updates.
            self.next(value)

    # TypeScript-compatible aliases
    def partialSubscribe(self, fn: Callable[[Any], None]):
        return self.partial_subscribe(fn)

    def partialNext(self, value: dict) -> None:
        return self.partial_next(value)

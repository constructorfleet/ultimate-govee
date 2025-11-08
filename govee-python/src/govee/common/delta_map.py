"""DeltaMap/DeltaSet minimal implementation mirroring TypeScript behavior.

This provides a Map-like container that tracks added/modified/deleted
entries and can publish MapDelta objects to subscribers via a simple
DeltaSubject pattern. It is intentionally minimal to satisfy unit tests
and device state translation.
"""
from __future__ import annotations

from typing import Dict, Generic, Iterable, Iterator, Optional, TypeVar
from collections.abc import MutableMapping
from .delta_types import MapDelta
from .observables import DeltaSubject

K = TypeVar("K")
V = TypeVar("V")


class DeltaMap(MutableMapping, Generic[K, V]):
    def __init__(self, entries: Optional[Iterable[tuple[K, V]]] = None, *, publish_empty: bool = True):
        self._store: Dict[K, V] = {}
        self.added: Dict[K, V] = {}
        self.modified: Dict[K, V] = {}
        self.deleted: Dict[K, V] = {}
        self._observed = DeltaSubject()
        self._publish = True
        self._publish_empty = publish_empty
        if entries:
            for k, v in entries:
                self._store[k] = v
                self.added[k] = v

    # MutableMapping methods
    def __getitem__(self, key: K) -> V:
        return self._store[key]

    def __setitem__(self, key: K, value: V) -> None:
        existed = key in self._store
        prev = self._store.get(key)
        self._store[key] = value
        if not existed:
            self.added[key] = value
        else:
            # treat always as modified if existed
            self.modified[key] = value
        self._publish_delta_if_needed()

    def __delitem__(self, key: K) -> None:
        if key in self._store:
            val = self._store[key]
            del self._store[key]
            # if it was newly added in this delta window, remove from added
            if key in self.added:
                del self.added[key]
            else:
                self.deleted[key] = val
            if key in self.modified:
                del self.modified[key]
            self._publish_delta_if_needed()
        else:
            raise KeyError(key)

    def __iter__(self) -> Iterator[K]:
        return iter(self._store)

    def __len__(self) -> int:
        return len(self._store)

    # extra convenience
    @property
    def delta_subject(self) -> DeltaSubject:
        return self._observed

    def get_delta(self) -> MapDelta:
        return MapDelta(all=dict(self._store), added=dict(self.added), modified=dict(self.modified), deleted=dict(self.deleted))

    # TypeScript-compatible alias
    def getDelta(self) -> MapDelta:
        return self.get_delta()

    def _publish_delta_if_needed(self) -> None:
        if not self._publish:
            return
        if self.added or self.modified or self.deleted or self._publish_empty:
            self._observed.next_delta(self.get_delta())
            # clear deltas after publish
            self.added.clear()
            self.modified.clear()
            self.deleted.clear()
            self._publish_empty = False

    def pause(self) -> None:
        self._publish = False

    # TypeScript-compatible aliases
    def pauseDelta(self) -> None:
        return self.pause()

    def resume(self) -> None:
        self._publish = True
        self._publish_delta_if_needed()

    def resumeDelta(self) -> None:
        return self.resume()


    def clear_delta(self) -> None:
        """Clear tracked deltas without publishing (snake_case alias)."""
        self.added.clear()
        self.modified.clear()
        self.deleted.clear()

    # TypeScript-compatible alias
    def clearDelta(self) -> None:
        return self.clear_delta()

    def delete_multiple(self, entry_ids: Iterable[K]) -> None:
        for entry_id in entry_ids:
            if entry_id in self._store:
                # reuse deletion logic
                del self[entry_id]

    # TypeScript-compatible alias
    def deleteMultiple(self, entry_ids: Iterable[K]) -> None:
        return self.delete_multiple(entry_ids)

class DeltaSet(DeltaMap[V, K]):
    # For tests we don't need extra behavior; keep as alias-ish
    pass

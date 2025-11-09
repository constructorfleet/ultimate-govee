from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Generic, Mapping, TypeVar

K = TypeVar("K")
V = TypeVar("V")


@dataclass
class MapDelta(Generic[K, V]):
    all: Mapping[K, V]
    added: Dict[K, V]
    modified: Dict[K, V]
    deleted: Dict[K, V]

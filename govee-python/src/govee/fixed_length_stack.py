"""Fixed length stack translated from lib/common/fixed-length-stack.ts

Simple LIFO with a maximum size. When full, the oldest elements are dropped.
"""
from __future__ import annotations

from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")


class FixedLengthStack(Generic[T]):
    def __init__(self, max_size: int) -> None:
        if max_size <= 0:
            raise ValueError("max_size must be > 0")
        self._max_size = max_size
        self._stack: List[T] = []

    def peek(self) -> Optional[T]:
        return self._stack[0] if self._stack else None

    def peek_all(self) -> List[T]:
        return list(self._stack)

    def enstack(self, item: T) -> None:
        if len(self._stack) >= self._max_size:
            self._stack.pop()
        self._stack.insert(0, item)

    def destack(self) -> Optional[T]:
        return self._stack.pop(0) if self._stack else None

    def size(self) -> int:
        return len(self._stack)

    def clear(self) -> None:
        self._stack.clear()


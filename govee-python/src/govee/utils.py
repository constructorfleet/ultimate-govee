"""Utility functions translated from lib/common/utils.ts

Keep implementations minimal and well-tested.
"""
from __future__ import annotations

from typing import Iterable, TypeVar, Callable, List

T = TypeVar("T")


def first(iterable: Iterable[T], predicate: Callable[[T], bool] | None = None) -> T | None:
    for item in iterable:
        if predicate is None or predicate(item):
            return item
    return None


def partition(iterable: Iterable[T], predicate: Callable[[T], bool]) -> tuple[List[T], List[T]]:
    trues: List[T] = []
    falses: List[T] = []
    for item in iterable:
        (trues if predicate(item) else falses).append(item)
    return trues, falses


"""Bit flag helpers translated from lib/common/bitflags.ts

Provide a small API to create named bit flags and operate on them.
"""
from __future__ import annotations

from typing import List


class BitFlagValue:
    def __init__(self, value: int) -> None:
        self.value = value

    def or_(self, other: "BitFlagValue") -> "BitFlagValue":
        return BitFlagValue(self.value | other.value)

    def union(self, *others: "BitFlagValue") -> "BitFlagValue":
        v = self.value
        for o in others:
            v |= o.value
        return BitFlagValue(v)

    def has_flag(self, other: "BitFlagValue") -> bool:
        return (self.value & other.value) != 0

    def intersect(self, *others: "BitFlagValue") -> "BitFlagValue":
        union = 0
        for o in others:
            union |= o.value
        return BitFlagValue(self.value & union)


class BitFlagEnum:
    def __init__(self, values: List[str]) -> None:
        self.keys = list(values)
        for i, name in enumerate(values):
            num = 1 << i
            setattr(self, name, BitFlagValue(num))

    def union(self, others: List[BitFlagValue]) -> BitFlagValue:
        ret = 0
        for o in others:
            ret |= o.value
        return BitFlagValue(ret)


def create_bitflags_enum(values: List[str]) -> BitFlagEnum:
    return BitFlagEnum(values)


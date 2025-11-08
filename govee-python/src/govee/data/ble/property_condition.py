"""Port of the TypeScript property.condition logic used by the BLE decoder.

This module implements propertyMatches(device, conditions) to evaluate
complex condition arrays against a decoded device. Tests in the TS suite
exercise bit tests, slices, and inverse logic; we implement the subset
required for parity with the decoder tests included in this repo.
"""
from __future__ import annotations

from typing import Any, List

And = "&"
Or = "|"
ManufacturerData = "manufacturerdata"
ServiceData = "servicedata"
Inverse = "inverse"
BitShift = "bit"


def property_matches(device: dict, conditions: List[Any], operand: Any = None) -> bool:
    if not conditions:
        return True
    if Or in conditions:
        groups: List[List[Any]] = [[]]
        for cond in conditions:
            if cond == Or:
                groups.append([])
            else:
                groups[-1].append(cond)
        return any(property_matches(device, g) for g in groups)

    head = conditions[0]
    # ManufacturerData / ServiceData handling
    if head in (ManufacturerData, ServiceData):
        if isinstance(conditions[1], int):
            data_key = head.replace('data', 'Data')
            data = device.get(data_key, '')
            # ensure operand is a string slice
            slice_val = data[conditions[1]:]
            return property_matches(device, conditions[2:], slice_val)
        # comparator length checks not implemented in minimal port
        return False

    if head == Inverse:
        return not property_matches(device, conditions[1:], operand)

    if head == BitShift:
        # operand expected to be a hex string; shift and mask
        if not isinstance(operand, str) or len(operand) < 2:
            return False
        try:
            val = int(operand[0:2], 16)
        except Exception:
            return False
        shift = int(conditions[1])
        bit = int(conditions[2])
        return (((val >> shift) & 0x01) == bit) and property_matches(device, conditions[3:], device)

    # default: prefix string match
    if isinstance(head, int) and isinstance(conditions[1], str) and isinstance(operand, str):
        if conditions[1][:head] == operand[:head]:
            return property_matches(device, conditions[3:])
        return False

    return False


__all__ = ["property_matches"]

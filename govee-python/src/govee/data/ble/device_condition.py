"""Port of the TypeScript device.condition logic used by the BLE decoder.

This module implements device_matches(device, conditions) to evaluate
complex condition arrays against a decoded device. It mirrors the
behavior of lib/data/ble/decoder/lib/device.condition.ts used by the
TypeScript decoder so the Python decoder can reach feature parity.
"""
from __future__ import annotations

from typing import Any, List

And = "&"
Or = "|"
ServiceData = "servicedata"
ManufacturerData = "manufacturerdata"
NoManufacturerData = "no-mfgdata"
Name = "name"
UUID = "uuid"
MacAtIndex = "mac@index"
ReverseMacAtIndex = "revmac@index"
Index = "index"
Inverse = "inverse"


def device_matches(device: dict, conditions: List[Any], operand: Any = None) -> bool:
    if not conditions:
        return True

    if Or in conditions:
        groups: List[List[Any]] = [[]]
        for cond in conditions:
            if cond == Or:
                groups.append([])
            else:
                groups[-1].append(cond)
        return any(device_matches(device, g) for g in groups)

    head = conditions[0]
    # Service/Manufacturer data handling
    if head == ServiceData:
        return device_matches(device, conditions[1:], device.get('serviceData'))
    if head == ManufacturerData:
        return device_matches(device, conditions[1:], device.get('manufacturerData'))
    if head == NoManufacturerData:
        md = device.get('manufacturerData') or ''
        return (len(md) == 0) and device_matches(device, conditions[1:])
    if head == Name:
        return device_matches(device, conditions[1:], (operand or device).get('name'))
    if head == UUID:
        return device_matches(device, conditions[1:], (operand or device).get('uuid'))
    if head == MacAtIndex:
        mac = device.get('macAddress', '')
        idx = conditions[1]
        try:
            return device_matches(device, conditions[2:], mac[idx])
        except Exception:
            return False
    if head == ReverseMacAtIndex:
        mac = device.get('macAddress', '')
        try:
            rev = ''.join(reversed(list(mac)))
            return device_matches(device, conditions[2:], rev[conditions[1]])
        except Exception:
            return False
    if head == And:
        return device_matches(device, conditions[1:])
    if head == Or:
        return True
    if head == Inverse:
        return not device_matches(device, conditions[1:], operand)
    if head == Index:
        if operand is None:
            return False
        start = int(conditions[1]) if isinstance(conditions[1], str) else conditions[1]
        try:
            return device_matches(device, conditions[2:], operand[start:])
        except Exception:
            return False

    # length / comparison helpers
    if head == '>=':
        op_len = operand if isinstance(operand, (int, float)) else len(operand or '')
        return (op_len >= int(conditions[1])) and device_matches(device, conditions[2:], operand)
    if head == '<=':
        op_len = operand if isinstance(operand, (int, float)) else len(operand or '')
        return (op_len <= int(conditions[1])) and device_matches(device, conditions[2:], operand)
    if head == '>':
        op_len = operand if isinstance(operand, (int, float)) else len(operand or '')
        return (op_len > int(conditions[1])) and device_matches(device, conditions[2:], operand)
    if head == '<':
        op_len = operand if isinstance(operand, (int, float)) else len(operand or '')
        return (op_len < int(conditions[1])) and device_matches(device, conditions[2:], operand)

    if head == '=':
        # string prefix match
        if isinstance(conditions[1], str):
            try:
                return str(operand).startswith(conditions[1]) and device_matches(device, conditions[2:], operand)
            except Exception:
                return False
        if isinstance(operand, str):
            return (len(operand) == conditions[1]) and device_matches(device, conditions[2:], operand)
        return (conditions[1] == operand) and device_matches(device, conditions[2:], operand)

    # default: check literal equality or string-prefix when condition is a string
    if isinstance(head, str):
        try:
            return str(operand).startswith(head) and device_matches(device, conditions[1:], operand)
        except Exception:
            return False
    if isinstance(operand, str):
        return (len(operand) == head) and device_matches(device, conditions[1:], operand)

    return (head == operand) and device_matches(device, conditions[1:], operand)


__all__ = ["device_matches"]

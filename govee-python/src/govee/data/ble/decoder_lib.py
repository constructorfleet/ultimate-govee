"""Port of the TypeScript BLE Decoder library used by the BLE decoder tests.

This module implements minimal parity with lib/data/ble/decoder/lib/decoder.ts
so unit tests that verify hex decoding and post-processing behave the same
way in Python as in TypeScript.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

# operation constants (mirrors decoder.constants.ts)
ServiceData = "servicedata"
ManufacturerData = "manufacturerdata"
NoManufacturerData = "no-mfgdata"
Name = "name"
UUID = "uuid"
And = "&"
Or = "|"
Contains = "contain"
MacAtIndex = "mac@index"
ReverseMacAtIndex = "revmac@index"
Index = "index"
Inverse = "inverse"
BitShift = "bit"
BitwiseAnd = "&"
BitwiseOr = "|"
Modulo = "%"
DivideBy = "/"
MultiplyBy = "*"
Add = "+"
Substract = "-"
GreaterThan = ">"
GreaterThanEqual = ">="
LessThan = "<"
LessThanEqual = "<="
Equals = "="
Calibration = ".cal"
ValueFromHex = "value_from_hex_string"
BCFValueFromHex = "bf_value_from_hex_string"


def chunk(lst: List[Any], n: int) -> List[List[Any]]:
    return [lst[i : i + n] for i in range(0, len(lst), n)]


def reverse_hex_data(hex_data: str, length: int) -> str:
    parts = chunk(list(hex_data[:length]), 2)
    parts.reverse()
    return "".join("".join(p) for p in parts)


def value_from_hex_string(
    hex_data: str,
    offset: int,
    length: int,
    reverse: bool = False,
    can_be_negative: bool = False,
    is_float: bool = False,
) -> int:
    hex_value = hex_data[offset : offset + length]
    value = reverse_hex_data(hex_value, length) if reverse else hex_value
    parsed_value = float(value) if is_float else int(value, 16)

    if can_be_negative:
        if length <= 2 and parsed_value > 128:
            return int(parsed_value - 256)
        if length == 4 and parsed_value > 32767:
            return int(parsed_value - 65536)
    return int(parsed_value)


def bcf_value_from_hex_string(
    hex_data: str,
    offset: int,
    length: int,
    reverse: bool = False,
    can_be_negative: bool = False,
    is_float: bool = False,
) -> float:
    v = value_from_hex_string(hex_data, offset, length, reverse, can_be_negative, is_float)
    d_value = ((v >> 8) * 100 + (v & 0xFF)) / 100.0
    return d_value


def evaluate_comparison(operator: str, operand: int, operant: int) -> bool:
    if operator == Equals:
        return operand == operant
    if operator == GreaterThanEqual:
        return operand >= operant
    if operator == GreaterThan:
        return operand > operant
    if operator == LessThanEqual:
        return operand <= operant
    if operator == LessThan:
        return operand < operant
    return False


def post_processing(value: Any, operations: List[Any], calibration: Optional[int] = None) -> Optional[Any]:
    if not operations:
        return value

    if len(operations) < 2:
        raise ValueError("Invalid post processing sequence")

    oper = operations[0]
    operant = operations[1]
    if operant == Calibration:
        operant_val = calibration or 0
    else:
        try:
            operant_val = float(operant)
        except:
            operant_val = 0

    # arithmetic / bitwise operations
    if oper == BitwiseAnd:
        return post_processing(int(value) & int(operant_val), operations[2:], calibration)
    if oper == BitwiseOr:
        return post_processing(int(value) | int(operant_val), operations[2:], calibration)
    if oper == Modulo:
        return post_processing(int(value) % int(operant_val), operations[2:], calibration)
    if oper == DivideBy:
        return post_processing(float(value) / float(operant_val), operations[2:], calibration)
    if oper == MultiplyBy:
        return post_processing(float(value) * float(operant_val), operations[2:], calibration)
    if oper == Add:
        return post_processing(float(value) + float(operant_val), operations[2:], calibration)
    if oper == Substract:
        return post_processing(float(value) - float(operant_val), operations[2:], calibration)

    # comparisons - if comparison true continue processing remainder, else undefined
    if oper in (GreaterThanEqual, GreaterThan, Equals, LessThanEqual, LessThan):
        if evaluate_comparison(oper, value, operant_val):
            return post_processing(value, operations[2:], calibration)
        return None

    # unknown op
    raise ValueError(f"Unknown operation {oper}")


class Decoder:
    @staticmethod
    def value_from_hex_string(*args, **kwargs):
        return value_from_hex_string(*args, **kwargs)

    @staticmethod
    def bf_value_from_hex_string(*args, **kwargs):
        return bcf_value_from_hex_string(*args, **kwargs)

    @staticmethod
    def decode(device: Dict[str, Any], decoder_args: List[Any], post_proc: Optional[List[Any]] = None, calibration: Optional[int] = None) -> Optional[Any]:
        # choose decoder based on decoder_args[0]
        decoder_name = decoder_args[0]
        if ValueFromHex in decoder_name:
            func = value_from_hex_string
        elif 'bf' in decoder_name:
            func = bcf_value_from_hex_string
        else:
            # unsupported decoder - return None
            return None

        data_source = decoder_args[1]
        # translate dataSource to device key like manufacturerData
        data_key = data_source.replace('data', 'Data')
        data = device.get(data_key) or ''
        # ensure data is a hex string
        if isinstance(data, bytes):
            data = data.hex()
        if not isinstance(data, str):
            data = str(data)

        args = [data, *decoder_args[2:]]
        try:
            value = func(*args)
        except Exception:
            return None

        if post_proc is None:
            return value
        return post_processing(value, post_proc, calibration)

    @staticmethod
    def decode_properties(device: Dict[str, Any], properties: Dict[str, Any]) -> Dict[str, Any]:
        decoded: Dict[str, Any] = {}
        calibration = None
        for name, prop in properties.items():
            # respect any property-level conditions before decoding
            cond = prop.get('condition')
            if cond:
                try:
                    # property_condition.property_matches expects device and the condition array
                    if not property_condition.property_matches(device, cond):
                        continue
                except Exception:
                    # on any failure evaluating condition, skip this property
                    continue

            val = Decoder.decode(device, prop.get('decoder', []), prop.get('post_proc'), calibration)
            if val is None:
                continue
            if name in ('tempc', '_tempc'):
                decoded.setdefault('temperature', {})['current'] = val
                if prop.get('post_proc') and any(p == Calibration for p in prop.get('post_proc', [])):
                    decoded['temperature']['calibration'] = calibration
            elif name.startswith('tempc') and name[-1].isdigit():
                idx = int(name[-1])
                decoded.setdefault('tempProbes', {})[idx] = val
            elif name in ('humidity', 'hum'):
                decoded['humidity'] = {'current': val}
            elif name in ('battery', 'batt'):
                decoded['battery'] = val
            elif name == '.cal':
                calibration = val
            else:
                # unknown property - ignore
                pass
        return decoded

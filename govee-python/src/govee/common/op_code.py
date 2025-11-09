"""Operation code helpers translated from lib/common/op-code.ts

Provide lightweight helpers for working with base64-encoded op-code
blobs and building framed opcode arrays used by device models/tests.
"""

from __future__ import annotations

from enum import IntEnum
import base64
from typing import List, Optional, Sequence


def array_range(count: int) -> List[int]:
    return list(range(count))


class OpType(IntEnum):
    COMMAND = 0x33
    REPORT = 0xAA


def hex_string_to_array(hex_string: str) -> List[int]:
    parts = hex_string.strip().split()
    return [int(p, 16) for p in parts if p]


def uint8_to_hex(data: Sequence[int] | bytes) -> str:
    b = bytes(data)
    s = b.hex()
    # insert space every two chars
    return " ".join(s[i : i + 2] for i in range(0, len(s), 2))


def unpadded_hex_to_array(hex_string: Optional[str]) -> Optional[List[int]]:
    if not hex_string:
        return None
    # split into bytes of two chars
    padded = "".join([hex_string[i : i + 2] for i in range(0, len(hex_string), 2)])
    # create spaced representation
    spaced = " ".join(padded[i : i + 2] for i in range(0, len(padded), 2))
    return hex_string_to_array(spaced)


def base64_to_hex_string(b64_string: str) -> str:
    decoded = base64.b64decode(b64_string)
    return uint8_to_hex(decoded)


def base64_to_hex(b64_string: str) -> List[int]:
    # Accept base64 strings possibly missing padding (common in JWTs/etc).
    s = b64_string
    pad = (-len(s)) % 4
    if pad:
        s = s + ("=" * pad)
    decoded = base64.b64decode(s)
    return hex_string_to_array(uint8_to_hex(decoded))


def buffer_to_hex(buffer: bytes) -> List[int]:
    return hex_string_to_array(uint8_to_hex(buffer))


def hex_to_base64(codes: Sequence[int]) -> str:
    return base64.b64encode(bytes(codes)).decode()


def total(codes: List[int], reverse: bool = False) -> int:
    arr = list(codes)
    if reverse:
        arr = list(reversed(arr))
    res = 0
    for index, code in enumerate(arr):
        res |= code << (8 * (len(arr) - index - 1))
    return res


def chunk(codes: List[int], chunk_size: int):
    return [codes[i * chunk_size : i * chunk_size + chunk_size] for i in range((len(codes) + chunk_size - 1) // chunk_size)]


def as_op_code(op_code: int, *values: Optional[int]) -> List[int]:
    """Build a padded opcode frame and return as list of ints.

    Values may include None; treat None as 0 when constructing frames to
    mirror original tests which sometimes pass None for placeholders.
    """
    flat: List[int] = []
    for v in values:
        if v is None:
            continue
        if isinstance(v, (list, tuple)):
            flat.extend(list(v))
        else:
            flat.append(int(v))

    cmd_frame = bytes([op_code, *flat])
    if len(cmd_frame) >= 19:
        cmd_padded = cmd_frame
    else:
        cmd_padded = cmd_frame + bytes([0] * (19 - len(cmd_frame)))

    # compute checksum as xor of all bytes in padded frame
    checksum = 0
    for b in cmd_padded:
        checksum ^= b

    final = cmd_padded + bytes([checksum])
    return list(final)


# Provide snake_case aliases matching usage in the Python port
base64_to_hex_string = base64_to_hex_string
base64_to_hex = base64_to_hex
hex_string_to_array = hex_string_to_array
buffer_to_hex = buffer_to_hex
hex_to_base64 = hex_to_base64
as_op_code = as_op_code
chunk = chunk
OpType = OpType

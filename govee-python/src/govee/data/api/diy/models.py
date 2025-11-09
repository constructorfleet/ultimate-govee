"""DIY models minimal port.

We only port the lightweight shape used by the domain code: DiyEffect with a
helper to rebuild op codes from base64. The underlying base64->hex helpers
live in the common module; implement a small wrapper compatible with the TS
shape used elsewhere.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from govee.common.op_code import OpType, as_op_code, base64_to_hex, chunk


@dataclass
class DiyEffect:
    name: str
    code: int
    cmd_version: int
    type: int
    diy_op_code_base64: Optional[str] = None


def rebuild_diy_op_code(code: Optional[int], op_code_base64: Optional[str]):
    """Rebuild a callable that returns opcode frames similar to the TS helper.

    Returns a function that accepts an identifier (list of numbers) and returns
    a list of list[int] or None.
    """

    def builder(identifier: Optional[List[int]] = None) -> Optional[List[List[int]]]:
        if op_code_base64 is None or code is None:
            return None
        codes = base64_to_hex(op_code_base64)
        # mimic TS: prepend 0x01,0x02,0x04 and then chunk into 17-byte lines
        lines = chunk([0x01, 0x02, 0x04] + codes[1:], 17)
        result = []
        for idx, line in enumerate(lines):
            result.append(as_op_code(163, 255 if idx == len(lines) - 1 else idx, *line))
        if identifier is None:
            identifier = []
        result.append(
            as_op_code(OpType.COMMAND, *(identifier + [code % 256, code >> 8]))
        )
        result.append(
            as_op_code(OpType.REPORT, *(identifier[:1] if identifier else [None]), 1)
        )
        return result

    return builder

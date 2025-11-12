from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from govee.common.op_code import OpType, as_op_code, base64_to_hex, chunk


@dataclass
class LightEffect:
    name: str
    id: int
    op_str_base64: Optional[str] = None


def rebuild_light_op_code(effect_id: Optional[int], op_str_base64: Optional[str]):
    def builder(identifier: Optional[List[int]] = None) -> Optional[List[List[int]]]:
        if op_str_base64 is None or effect_id is None:
            return None
        codes = base64_to_hex(op_str_base64)
        lines = chunk([0x02, 0x03] + codes, 16)
        result = []
        for idx, line in enumerate(lines):
            result.append(as_op_code(0xA1, idx, *line))
        if identifier is None:
            identifier = []
        result.append(
            as_op_code(
                OpType.COMMAND,
                *(identifier + [effect_id & 0xFF, (effect_id >> 8) & 0xFF]),
            )
        )
        result.append(
            as_op_code(OpType.REPORT, *(identifier[:1] if identifier else [0x00]), 1)
        )
        return result

    return builder

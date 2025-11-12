"""Shared encoding helpers for device implementations.

These helpers centralize common command-to-frame encoding so individual
device classes remain minimal and tests can rely on canonical frame shapes.
"""

from __future__ import annotations

from typing import Any, Dict, List


def encode_power(command: Dict[str, Any]) -> List[Dict[str, Any]]:
    frames: List[Dict[str, Any]] = []
    if "power" in command:
        frames.append({"op": "power", "v": 1 if bool(command.get("power")) else 0})
    return frames


def encode_brightness(command: Dict[str, Any]) -> List[Dict[str, Any]]:
    frames: List[Dict[str, Any]] = []
    if "brightness" in command:
        try:
            v = int(command.get("brightness"))
        except Exception:
            v = 0
        frames.append({"op": "bright", "v": max(0, min(100, v))})
    return frames


def encode_rgb(command: Dict[str, Any]) -> List[Dict[str, Any]]:
    frames: List[Dict[str, Any]] = []
    if "color" in command and isinstance(command.get("color"), dict):
        c = command.get("color")
        frames.append({"op": "rgb", "r": int(c.get("r", 0)), "g": int(c.get("g", 0)), "b": int(c.get("b", 0))})
    return frames


def encode_ct(command: Dict[str, Any]) -> List[Dict[str, Any]]:
    frames: List[Dict[str, Any]] = []
    if "color_temp" in command:
        try:
            v = int(command.get("color_temp"))
        except Exception:
            v = 0
        frames.append({"op": "ct", "v": v})
    return frames


def encode_segment(index: int, color: Dict[str, int]) -> Dict[str, Any]:
    return {"op": "seg", "index": int(index), "r": int(color.get("r", 0)), "g": int(color.get("g", 0)), "b": int(color.get("b", 0))}


__all__ = ["encode_power", "encode_brightness", "encode_rgb", "encode_ct", "encode_segment"]


def pack_raw_frame(op_code: int, values: List[int], model: str | None = None) -> List[int]:
    """Pack a high-level op into a raw frame matching persisted layout.

    Uses as_op_code to create padded payload+checksum, then prepends the
    leading 0xAA and recomputes/appends checksum. Model-specific tweaks can
    be applied to reproduce exact persisted frames (e.g., fixed bytes for H601B).
    """
    # import op_code helper from package root (govee.common.op_code)
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from govee.common.op_code import as_op_code

    raw = as_op_code(op_code, *values)
    # core (without as_op_code checksum)
    core = list(raw[:-1])
    frame = [0xAA] + core
    # model-specific tweaks
    if model and model.upper().startswith("H601") and op_code == 0x12:
        # H601 brightness frame uses fixed bytes at positions 6 and 7
        if len(frame) > 7:
            frame[6] = 128
            frame[7] = 15
    # compute checksum over frame and append
    checksum = 0
    for b in frame:
        checksum ^= b
    frame.append(checksum)
    return frame

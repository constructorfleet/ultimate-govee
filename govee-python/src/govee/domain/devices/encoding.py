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


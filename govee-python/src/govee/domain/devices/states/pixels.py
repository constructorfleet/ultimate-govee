"""Pixel array state for RGBIC devices.

This state handles encoding/decoding of pixel arrays reported by some
firmwares (payload['pixels'] = [[r,g,b], ...]) and provides an encode
method so devices can delegate pixel array encoding.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class PixelsState:
    def __init__(self, device: Any):
        self.device = device
        self.pixels: List[List[int]] = []

    def parse(self, payload: Dict[str, Any]) -> None:
        px = payload.get('pixels')
        if px and isinstance(px, list):
            out = []
            for p in px:
                try:
                    out.append([int(x) for x in p])
                except Exception:
                    continue
            self.pixels = out

    def get(self) -> List[List[int]]:
        return self.pixels

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        if 'pixels' in command and isinstance(command.get('pixels'), list):
            frames.append({'op': 'pixels', 'pixels': [list(map(int, p)) for p in command.get('pixels')]})
        return frames


__all__ = ['PixelsState']

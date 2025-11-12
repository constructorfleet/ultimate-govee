"""Scene/Mode state minimal implementation for RGBIC devices.

This provides a small parser for scene/mode payloads and an accessor
used by parity tests. It is intentionally minimal and focuses on the
surface the tests require (parse and get current scene/mode).
"""
from __future__ import annotations

from typing import Any, Dict, Optional


class SceneModeState:
    def __init__(self, device: Any):
        self.device = device
        self.scene: Optional[str] = None
        self.mode_id: Optional[int] = None

    def parse(self, payload: Dict[str, Any]) -> None:
        # common keys used by firmwares: 'scene', 'mode', 'sceneId'
        if not payload:
            return
        if 'scene' in payload and isinstance(payload.get('scene'), str):
            self.scene = payload.get('scene')
        elif 'mode' in payload:
            v = payload.get('mode')
            if isinstance(v, str):
                self.scene = v
            else:
                try:
                    self.mode_id = int(v)
                except Exception:
                    self.mode_id = None
        elif 'sceneId' in payload:
            try:
                self.mode_id = int(payload.get('sceneId'))
            except Exception:
                self.mode_id = None

    def get(self) -> Dict[str, Optional[Any]]:
        return {'scene': self.scene, 'mode_id': self.mode_id}


__all__ = ['SceneModeState']


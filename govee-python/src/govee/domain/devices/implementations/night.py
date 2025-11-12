"""Night mode device: small subclass for night-specific behavior."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .white import WhiteDevice


class NightDevice(WhiteDevice):
    def __init__(self, id: str, model: Optional[str] = None, name: Optional[str] = None):
        super().__init__(id=id, model=model, name=name)
        self.night: bool = False

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        super().apply_payload(payload)
        # track night flag if present
        self.night = bool(payload.get("night", False))

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames = super().encode_command(command)
        if "night" in command:
            frames.append({"op": "night", "v": 1 if bool(command.get("night")) else 0})
        return frames


__all__ = ["NightDevice"]

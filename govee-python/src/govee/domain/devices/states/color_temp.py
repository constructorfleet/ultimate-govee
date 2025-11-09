"""Color temperature state implementation.

Provides parse_state and state_to_command parity with the TypeScript
ColorTempState behavior used in unit tests.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

from .device_op_state import DeviceOpState


def is_number(v: Any) -> bool:
    return isinstance(v, (int, float))


def is_between(v: Any, a: float, b: float) -> bool:
    try:
        return a <= float(v) <= b
    except Exception:
        return False


class ColorTempState(DeviceOpState):
    def __init__(self):
        super().__init__("colorTemperature", initial={"current": None, "range": {}})

    def parse_state(self, data: Optional[Dict[str, Any]]) -> None:
        current_value = self.state_value.get_value() or {"current": None, "range": {}}
        color_temp = None
        if isinstance(data, dict):
            state = data.get("state")
            if isinstance(state, dict):
                color_temp = state.get("colorTemperature")

        current = None
        minv = current_value.get("range", {}).get("min")
        maxv = current_value.get("range", {}).get("max")
        if isinstance(color_temp, dict):
            current = color_temp.get("current", current_value.get("current"))
            minv = color_temp.get("min", minv)
            maxv = color_temp.get("max", maxv)

        if current is not None:
            if minv is not None and current < minv:
                return
            if maxv is not None and current > maxv:
                return

        if color_temp is not None:
            self.state_value.next(color_temp)
            self._emit_state(color_temp)

    def state_to_command(self, next_state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        rng = next_state.get("range") if isinstance(next_state, dict) else None
        minv = None
        maxv = None
        if isinstance(rng, dict):
            minv = rng.get("min")
            maxv = rng.get("max")
        if minv is not None and maxv is not None:
            if not is_between(next_state.get("current"), minv, maxv):
                return None
        else:
            if not is_number(next_state.get("current")):
                return None

        return {
            "status": {"state": {"colorTemperature": {"current": next_state.get("current")}}},
            "command": {"command": "colorTem", "data": {"colorTemInKelvin": next_state.get("current")}},
        }


__all__ = ["ColorTempState"]

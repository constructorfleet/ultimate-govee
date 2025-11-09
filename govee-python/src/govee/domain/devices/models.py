from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

from .states.power import parse_power
from .states.brightness import parse_brightness
from .states.color import parse_color
from .states.effect import parse_effect
from .states.temperature import parse_temperature
from .states.connected import parse_connected
from .states.humidity import parse_humidity


@dataclass
class DeviceState:
    power: Optional[bool] = None
    brightness: Optional[int] = None
    color: Optional[Any] = None
    connected: Optional[bool] = None
    color_temp: Optional[int] = None
    temperature: Optional[float] = None
    battery: Optional[int] = None
    humidity: Optional[int] = None
    effect_name: Optional[str] = None
    effect_id: Optional[int] = None
    effect: Optional[Dict[str, Any]] = None
    temperature_calibration: Optional[int] = None
    temp_probes: Optional[Dict[int, float]] = None

def parse_state(payload: Dict[str, Any]) -> DeviceState:
    return DeviceState(
        power=parse_power(payload),
        brightness=parse_brightness(payload),
        # support both nested rgb dicts and comma/colon-separated strings
        color=parse_color(payload),
        color_temp=payload.get("color_temp") or payload.get("ct"),
        # temperature, calibration and probes
        temperature=parse_temperature(payload)[0],
        temperature_calibration=parse_temperature(payload)[1],
        temp_probes=parse_temperature(payload)[2],
        # connected/online
        connected=parse_connected(payload),
        battery=payload.get("battery") or payload.get("batt"),
        humidity=payload.get("humidity") or payload.get("hum"),
        effect_name=payload.get("effect") or payload.get("effectName"),
        effect_id=payload.get("effectId"),
        # normalized effect info
        effect=parse_effect(payload),
    )

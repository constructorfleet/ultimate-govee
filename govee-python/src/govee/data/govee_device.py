"""Data models for Govee devices translated from lib/data/govee-device.ts

Provide typed dataclasses representing the device status and command
payloads used across the codebase. Kept intentionally simple but faithful to
the TypeScript shapes so tests can validate parsing and mapping logic.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass
class Measurement:
    min: Optional[float] = None
    max: Optional[float] = None
    calibration: Optional[float] = None
    warning: Optional[bool] = None
    current: Optional[float] = None


@dataclass
class Color:
    red: int = 0
    green: int = 0
    blue: int = 0


@dataclass
class GoveeDeviceStatus:
    id: str
    model: str
    pactType: int = 0
    pactCode: int = 0
    state: Dict[str, Any] = field(default_factory=dict)
    cmd: Optional[str] = None
    op: Optional[Dict[str, Any]] = None


@dataclass
class GoveeDevice(GoveeDeviceStatus):
    name: str = ""
    ic: int = 0
    iotTopic: Optional[str] = None
    groupId: int = 0
    goodsType: int = 0
    softwareVersion: str = ""
    hardwareVersion: str = ""
    wifi: Optional[Dict[str, Any]] = None
    blueTooth: Optional[Dict[str, Any]] = None
    deviceExt: Optional[Dict[str, Any]] = None


@dataclass
class GoveeCommandDataColor:
    red: int
    green: int
    blue: int


@dataclass
class GoveeCommandData:
    command: Optional[Any] = None
    color: Optional[GoveeCommandDataColor] = None
    value: Optional[Any] = None
    val: Optional[Any] = None
    colorTemInKelvin: Optional[int] = None
    opcode: Optional[str] = None
    modeValue: Optional[str] = None


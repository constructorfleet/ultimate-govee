"""Core common types translated from lib/common/types.ts

This module provides lightweight Python equivalents for the TypeScript types
used across the project. We intentionally keep implementations minimal to
support unit tests and incremental translation.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Callable, Protocol

LabelFn = Callable[[], str]
LabelType = str | LabelFn


def resolve_label(label: LabelType) -> str:
    return label() if callable(label) else label


Username = str
Password = str
AccountId = str
ClientId = str
DeviceId = str


@dataclass
class Credentials:
    username: Username
    password: Password
    client_id: Optional[ClientId] = None


@dataclass
class DeviceCommandAddresses:
    iot_topic: Optional[str] = None
    ble_address: Optional[str] = None


@dataclass
class Distance:
    value: Optional[float] = None
    unit: Optional[str] = None


@dataclass
class Duration:
    value: Optional[float] = None
    unit: Optional[str] = None


class Labelled(Protocol):
    label: LabelType


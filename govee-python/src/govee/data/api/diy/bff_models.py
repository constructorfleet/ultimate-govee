"""Minimal BFF models for DIY one-click/tap-to-run responses.

These are lightweight dataclasses to support the GoveeDiyService.get_one_clicks
behavior in the Python package tests.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, List, Optional


@dataclass
class ComponentResponse:
    type: Optional[int] = None


@dataclass
class OneClickResponse:
    name: Optional[str] = None
    planType: Optional[int] = None
    siriEngineId: Optional[int] = None
    presetId: Optional[int] = None
    groupName: Optional[str] = None
    groupId: Optional[int] = None
    description: Optional[str] = None
    presetState: Optional[int] = None
    type: int = 0
    iotRules: List[Any] = None


@dataclass
class OneClickComponent(ComponentResponse):
    guideUrl: Optional[str] = None
    oneClicks: List[OneClickResponse] = None


@dataclass
class ComponentsResponse:
    components: List[ComponentResponse]


@dataclass
class TapToRunResponse:
    data: ComponentsResponse

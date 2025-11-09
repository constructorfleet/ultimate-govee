"""Device API models translated from lib/data/api/device/models/device-list.response.ts

Lightweight dataclasses to represent the shapes returned by the Govee
REST API for device listings. Field names intentionally mirror the
original TypeScript models (camelCase) so dict -> dataclass
instantiation is straightforward when the request helper does
as_type(**data).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class DeviceSettings:
    wifiName: Optional[str] = None
    wifiMacAddress: Optional[str] = None
    bleName: Optional[str] = None
    topic: Optional[str] = None
    bleAddress: Optional[str] = None
    pactType: Optional[int] = None
    pactCode: Optional[int] = None
    notifyWaterBoiling: Optional[bool] = None
    notifyComplete: Optional[bool] = None
    automaticShutDown: Optional[bool] = None
    filterExpired: Optional[bool] = None
    playState: Optional[bool] = None
    wifiSoftVersion: Optional[str] = None
    wifiHardwareVersion: Optional[str] = None
    hardwareVersion: Optional[str] = None
    softwareVersion: Optional[str] = None
    ic: Optional[int] = None
    secretCode: Optional[str] = None
    deviceId: Optional[str] = None
    deviceName: Optional[str] = None
    model: Optional[str] = None
    waterShortage: Optional[bool] = None
    batteryLevel: Optional[int] = None
    maxHumidity: Optional[int] = None
    minHumidity: Optional[int] = None
    Calibration: Optional[int] = None
    humidityWarning: Optional[bool] = None
    maxTemperature: Optional[int] = None
    minTemperature: Optional[int] = None
    temperatureCalibration: Optional[int] = None
    temperatureWarning: Optional[bool] = None
    uploadRate: Optional[int] = None
    bdType: Optional[int] = None
    mcuSoftwareVersion: Optional[str] = None
    mcuHardwareVersion: Optional[str] = None
    time: Optional[int] = None


@dataclass
class DeviceData:
    isOnline: Optional[bool] = None
    isOn: Optional[bool] = None
    bind: Optional[bool] = None
    currentTemperature: Optional[int] = None
    currentHumditity: Optional[int] = None
    lastReportTimestamp: Optional[int] = None


@dataclass
class DeviceExternalResources:
    imageUrl: Optional[str] = None
    onImageUrl: Optional[str] = None
    offImageUrl: Optional[str] = None
    ext: Optional[str] = None
    ic: Optional[int] = None


@dataclass
class DeviceExtensionProperties:
    # The API returns these properties as JSON strings in some endpoints.
    # Tests/services in this package expect nested dicts/dataclasses; the
    # request helper may instantiate these classes directly when passed the
    # response dict. Keep the fields permissive (Any) to allow both raw dicts
    # and already-parsed values.
    deviceSettings: Optional[DeviceSettings] = None
    deviceData: Optional[DeviceData] = None
    externalResources: Optional[DeviceExternalResources] = None
    subDevice: Optional[str] = None


@dataclass
class GoveeAPIDevice:
    groupId: Optional[int] = None
    device: Optional[str] = None
    sku: Optional[str] = None
    spec: Optional[str] = None
    verionHard: Optional[str] = None
    versionSoft: Optional[str] = None
    deviceName: Optional[str] = None
    pactType: Optional[int] = None
    pactCode: Optional[int] = None
    goodsType: Optional[int] = None
    deviceExt: Optional[DeviceExtensionProperties] = None


@dataclass
class DeviceListResponse:
    message: Optional[str] = None
    status: Optional[int] = None
    devices: Optional[List[GoveeAPIDevice]] = None

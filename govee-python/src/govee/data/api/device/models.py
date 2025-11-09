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

import json


def _parse_bool(v: Any) -> Optional[bool]:
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    s = str(v).lower()
    if s in ("1", "true", "yes"):
        return True
    if s in ("0", "false", "no"):
        return False
    return None



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


# convenience constructors to handle nested JSON strings returned by some endpoints
    pass
# NOTE: the original file already defines these classes; append helper methods below

# BEGIN parsing helpers

def _ensure_dict(x: Any) -> dict:
    if x is None:
        return {}
    if isinstance(x, dict):
        return x
    if isinstance(x, str):
        try:
            return json.loads(x)
        except Exception:
            return {}
    return dict(x)

# Add from_dict implementations after class definitions by monkey patching for simplicity
# (keeps the original dataclass definitions intact above)

def device_settings_from_dict(data: Any) -> DeviceSettings:
    d = _ensure_dict(data)
    return DeviceSettings(
        wifiName=d.get("wifiName"),
        wifiMacAddress=d.get("wifiMac") or d.get("wifiMacAddress"),
        bleName=d.get("bleName"),
        topic=d.get("topic"),
        bleAddress=d.get("address") or d.get("bleAddress"),
        pactType=d.get("pactType"),
        pactCode=d.get("pactCode"),
        notifyWaterBoiling=_parse_bool(d.get("boilWaterCompletedNotiOnOff") or d.get("notifyWaterBoiling")),
        notifyComplete=_parse_bool(d.get("completionNotiOnOff") or d.get("notifyComplete")),
        automaticShutDown=_parse_bool(d.get("autoShutDownOnOff") or d.get("automaticShutDown")),
        filterExpired=_parse_bool(d.get("filterExpireOnOff") or d.get("filterExpired")),
        playState=_parse_bool(d.get("playState")),
        wifiSoftVersion=d.get("wifiSoftVersion"),
        wifiHardwareVersion=d.get("wifiHardVersion") or d.get("wifiHardwareVersion"),
        hardwareVersion=d.get("versionHard"),
        softwareVersion=d.get("versionSoft"),
        ic=d.get("ic"),
        secretCode=d.get("secretCode"),
        deviceId=d.get("device"),
        deviceName=d.get("deviceName"),
        model=d.get("sku") or d.get("model"),
        waterShortage=_parse_bool(d.get("waterShortageOnOff")) if d.get("waterShortageOnOff") is not None else None,
        batteryLevel=d.get("battery"),
        maxHumidity=d.get("humMax"),
        minHumidity=d.get("humMin"),
        Calibration=d.get("humCali") or d.get("humCali"),
        humidityWarning=_parse_bool(d.get("humWarning") or d.get("humidityWarning")),
        maxTemperature=d.get("temMax"),
        minTemperature=d.get("temMin"),
        temperatureCalibration=d.get("temCali"),
        temperatureWarning=_parse_bool(d.get("temWarning") or d.get("temperatureWarning")),
        uploadRate=d.get("uploadRate"),
        bdType=d.get("bdType"),
        mcuSoftwareVersion=d.get("mcuSoftVersion"),
        mcuHardwareVersion=d.get("mcuHardVersion"),
        time=d.get("time"),
    )

DeviceSettings.from_dict = staticmethod(device_settings_from_dict)


def device_data_from_dict(data: Any) -> DeviceData:
    d = _ensure_dict(data)
    return DeviceData(
        isOnline=_parse_bool(d.get("online")),
        isOn=_parse_bool(d.get("isOnOff") or d.get("isOn")),
        bind=_parse_bool(d.get("bind")),
        currentTemperature=d.get("tem"),
        currentHumditity=d.get("hum"),
        lastReportTimestamp=d.get("lastTime"),
    )

DeviceData.from_dict = staticmethod(device_data_from_dict)


def device_ext_resources_from_dict(data: Any) -> DeviceExternalResources:
    d = _ensure_dict(data)
    return DeviceExternalResources(
        imageUrl=d.get("skuImageUrl") or d.get("imageUrl"),
        onImageUrl=d.get("onImageUrl"),
        offImageUrl=d.get("offImageUrl"),
        ext=d.get("ext"),
        ic=d.get("ic"),
    )

DeviceExternalResources.from_dict = staticmethod(device_ext_resources_from_dict)


def device_extension_from_dict(data: Any) -> DeviceExtensionProperties:
    d = _ensure_dict(data)
    return DeviceExtensionProperties(
        deviceSettings=DeviceSettings.from_dict(d.get("deviceSettings") or d.get("deviceSettings")),
        deviceData=DeviceData.from_dict(d.get("lastDeviceData") or d.get("lastDeviceData") or d.get("lastDeviceData")),
        externalResources=DeviceExternalResources.from_dict(d.get("extResources") or d.get("extResources")),
        subDevice=d.get("subDevice"),
    )

DeviceExtensionProperties.from_dict = staticmethod(device_extension_from_dict)


def govee_api_device_from_dict(data: Any) -> GoveeAPIDevice:
    d = _ensure_dict(data)
    return GoveeAPIDevice(
        groupId=d.get("groupId"),
        device=d.get("device"),
        sku=d.get("sku"),
        spec=d.get("spec"),
        verionHard=d.get("versionHard"),
        versionSoft=d.get("versionSoft"),
        deviceName=d.get("deviceName"),
        pactType=d.get("pactType"),
        pactCode=d.get("pactCode"),
        goodsType=d.get("goodsType"),
        deviceExt=DeviceExtensionProperties.from_dict(d.get("deviceExt")),
    )

GoveeAPIDevice.from_dict = staticmethod(govee_api_device_from_dict)


def device_list_response_from_dict(data: Any) -> DeviceListResponse:
    d = _ensure_dict(data)
    devices_raw = d.get("devices") or d.get("data") or []
    devices = [GoveeAPIDevice.from_dict(x) for x in devices_raw]
    return DeviceListResponse(message=d.get("message"), status=d.get("status"), devices=devices)

DeviceListResponse.from_dict = staticmethod(device_list_response_from_dict)
# END parsing helpers

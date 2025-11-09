"""Devices API service.

Minimal implementation supporting the tests in tests/test_devices_api_service*.py
The service delegates network calls to a request factory (defaulting to
govee.data.utils.request.request) which returns an object with async get/post
methods. The service normalizes response shapes and maps them into lightweight
Device and DeviceState dataclasses defined in this package.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional

# default URL is not used in tests but keep a placeholder for callers
DEVICE_INFO_URL = "https://api.govee.com/devices/getDevice"


@dataclass
class DeviceState:
    # Keep a permissive shape compatible with the tests which construct
    # DeviceState using several common fields.
    id: Optional[str] = None
    raw: Dict[str, Any] = None
    on: Optional[bool] = None
    brightness: Optional[int] = None
    color: Optional[Any] = None


@dataclass
class Device:
    id: str
    model: Optional[str] = None
    name: Optional[str] = None
    state: Optional[DeviceState] = None


class DevicesApiService:
    def __init__(self, request: Optional[Callable[..., Any]] = None) -> None:
        # request is a factory: request(url, headers, payload) -> Request
        if request is None:
            from govee.data.utils.request import request as request_factory

            self._request = request_factory
        else:
            self._request = request

    async def get_device_info(self, device_id: str, client_id: Optional[str] = None) -> Device:
        headers: Dict[str, str] = {}
        if client_id:
            headers["x-govee-client-id"] = client_id

        req = self._request(DEVICE_INFO_URL, headers=headers, payload={"deviceId": device_id})
        resp = await req.get()

        # normalize payload: some request helpers return {"data": {...}}
        payload = resp.get("data", resp) if isinstance(resp, dict) else resp

        # normalize device fields
        dev_id = payload.get("device") or payload.get("id") or device_id
        model = payload.get("model")
        name = payload.get("name")
        state_raw = payload.get("state") or {}

        # derive boolean 'on' from common shapes
        on_val = None
        if isinstance(state_raw, dict):
            if "on" in state_raw:
                on_val = bool(state_raw.get("on"))
            elif "power" in state_raw:
                # power may be 1/0
                on_val = bool(state_raw.get("power"))

        brightness = None
        if isinstance(state_raw, dict):
            brightness = state_raw.get("brightness") or state_raw.get("bri")

        state = DeviceState(raw=state_raw, on=on_val, brightness=brightness)

        return Device(id=str(dev_id), model=model, name=name, state=state)

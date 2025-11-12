"""OpenAPI channel adapter: publish and control via OpenAPIService."""
from __future__ import annotations

from typing import Any

from .openapi_service import OpenAPIService


class OpenAPIChannel:
    def __init__(self, openapi: OpenAPIService) -> None:
        self.openapi = openapi

    async def control_device(self, device_id: str, command: dict) -> Any:
        path = f"/devices/{device_id}/control"
        return await self.openapi.post(path, data=command)

    async def get_devices(self) -> Any:
        return await self.openapi.get('/devices')

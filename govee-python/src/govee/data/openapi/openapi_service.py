"""Minimal OpenAPI HTTP client stub used by tests.

This provides a tiny async HTTP client that can perform GET/POST requests
and record calls for assertions. The real project uses a generated OpenAPI
client; tests only need a predictable stub.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class OpenAPIService:
    def __init__(self) -> None:
        self.calls: list[Dict[str, Any]] = []

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        self.calls.append({"method": "GET", "path": path, "params": params})
        # return dummy payload
        return {"ok": True, "path": path, "params": params}

    async def post(self, path: str, data: Optional[Dict[str, Any]] = None) -> Any:
        self.calls.append({"method": "POST", "path": path, "data": data})
        return {"ok": True, "path": path, "data": data}

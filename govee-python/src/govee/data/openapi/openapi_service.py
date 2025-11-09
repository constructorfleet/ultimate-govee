"""Minimal OpenAPI HTTP client stub used by tests.

This provides a tiny async HTTP client that can perform GET/POST requests
and record calls for assertions. The real project uses a generated OpenAPI
client; tests only need a predictable stub.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


class OpenAPIService:
    def __init__(self, request: Optional[callable]=None) -> None:
        # tests sometimes pass a request factory; if provided use it to
        # produce responses synchronously in our async helpers.
        self._request = request
        self.calls: list[Dict[str, Any]] = []

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        self.calls.append({"method": "GET", "path": path, "params": params})
        if self._request is not None:
            return self._request({"method":"GET","path":path,"params":params})
        return {"ok": True, "path": path, "params": params}

    async def post(self, path: str, data: Optional[Dict[str, Any]] = None) -> Any:
        self.calls.append({"method": "POST", "path": path, "data": data})
        if self._request is not None:
            return self._request({"method":"POST","path":path,"data":data})
        return {"ok": True, "path": path, "data": data}

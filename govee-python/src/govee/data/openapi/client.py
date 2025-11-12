"""Async OpenAPI client wrapper for IoT credential retrieval.

This lightweight client is intentionally small: it accepts a synchronous
session callable (compatible with govee.data.utils.httpx_session.default_session)
and runs it in a thread to provide an async API. Retries and timeouts are
implemented for idempotent (GET) calls.
"""

from __future__ import annotations

import asyncio
from typing import Any, Callable, Dict, Optional

from govee.data.utils.httpx_session import default_session


class OpenApiError(Exception):
    pass


class OpenApiNotFound(OpenApiError):
    pass


class OpenApiTimeout(OpenApiError):
    pass


class AsyncOpenApiClient:
    def __init__(
        self,
        base_url: str = "",
        session: Optional[Callable[..., Dict[str, Any]]] = None,
        retries: int = 3,
        timeout: float = 5.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._session = session or default_session
        self.retries = retries
        self.timeout = timeout

    async def _call(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"

        def sync_call():
            return self._session(method, url, **kwargs)

        # run sync session in a thread to avoid blocking the loop
        try:
            resp = await asyncio.wait_for(
                asyncio.to_thread(sync_call), timeout=self.timeout
            )
        except asyncio.TimeoutError:
            raise OpenApiTimeout("request timed out")

        status = int(resp.get("status", 0))
        if status == 404:
            raise OpenApiNotFound(f"{url} returned 404")
        return resp

    async def get_iot_credentials(self, device_id: str) -> Dict[str, Any]:
        path = f"/iot/credentials/{device_id}"
        attempt = 0
        last_exc: Optional[Exception] = None
        while attempt < self.retries:
            try:
                resp = await self._call("GET", path)
                status = int(resp.get("status", 0))
                if status >= 500:
                    # transient server error -> retry
                    attempt += 1
                    await asyncio.sleep(0.05 * (2**attempt))
                    continue
                data = resp.get("data") or {}
                # some fixtures embed payload under 'data'
                if isinstance(data, dict) and "data" in data:
                    return data["data"]
                return data
            except OpenApiNotFound:
                raise
            except OpenApiTimeout:
                # Treat timeouts as terminal errors: do not retry indefinitely
                # as the caller likely needs to react to connectivity/timeouts.
                raise
            except Exception as e:
                last_exc = e
                attempt += 1
                await asyncio.sleep(0.05 * (2**attempt))
                continue

        raise OpenApiError(f"failed to get iot credentials: {last_exc}")

    __doc__ = """AsyncOpenApiClient provides a minimal async-compatible wrapper
    around a synchronous HTTP session callable. Example usage:

    >>> async def example():
    ...     def session(method, url, **kwargs):
    ...         return {"status": 200, "data": {"endpoint": "mqtt://example", "clientId": "c1", "topic": "govee/device/#"}}
    ...     client = AsyncOpenApiClient(base_url='http://api', session=session)
    ...     creds = await client.get_iot_credentials('device-1')
    ...     assert 'topic' in creds

    The client supports configurable retries and timeouts and will raise
    OpenApiTimeout for timeouts and OpenApiNotFound for 404 responses.
    """

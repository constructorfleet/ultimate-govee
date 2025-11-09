"""Async httpx session wrapper with retry/backoff.

Provides a coroutine-compatible session callable for Request. Uses httpx.AsyncClient
when available. If httpx is missing, the module raises a clear ImportError when
the default session is used so callers can fall back or provide their own.
"""

from __future__ import annotations

import asyncio
from typing import Any, Callable, Dict, Optional

try:
    import httpx  # type: ignore

    _HAVE_HTTPX = True
except Exception:  # pragma: no cover - environment specific
    httpx = None  # type: ignore
    _HAVE_HTTPX = False


def _make_default_async_session(
    max_retries: int = 3, backoff_factor: float = 0.2, timeout: float = 10.0
) -> Callable[..., Any]:
    if not _HAVE_HTTPX:
        # Provide a placeholder that raises early to make the error obvious.
        async def _no_httpx(*_args, **_kwargs):
            raise ImportError(
                "httpx is required for the async HTTP session; install httpx or provide a custom session"
            )

        return _no_httpx

    client = httpx.AsyncClient(timeout=timeout)

    async def session(
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        attempts = max_retries if method.upper() == "GET" else 1
        for attempt in range(attempts):
            try:
                resp = await client.request(
                    method, url, headers=headers, params=params, json=json
                )
                # If status indicates server error, and we have retries left, backoff
                if 500 <= resp.status_code < 600 and attempt < attempts - 1:
                    await asyncio.sleep(backoff_factor * (2**attempt))
                    continue
                # attempt to parse JSON body
                try:
                    body = resp.json() if resp.content else {}
                except Exception:
                    body = {}
                return {
                    "status": resp.status_code,
                    "statusText": resp.reason_phrase,
                    "data": body,
                }
            except Exception:
                if attempt >= attempts - 1:
                    raise
                # exponential backoff
                await asyncio.sleep(backoff_factor * (2**attempt))
        # Should not reach here
        raise RuntimeError("unreachable")

    return session


default_async_session = _make_default_async_session()

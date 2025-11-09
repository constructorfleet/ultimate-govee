"""Simple httpx session wrapper with retry/backoff.

This wrapper provides a `session` callable compatible with the Request
helper's expected signature: session(method, url, headers=..., params=..., json=...).

It uses httpx under the hood and implements a basic retry loop with
exponential backoff for idempotent requests (GET). For simplicity and to
keep test speed reasonable, configuration is lightweight.
"""

from __future__ import annotations

import time
from typing import Any, Dict, Optional

# Try to import httpx but fall back to a simple urllib-based implementation
# if httpx is not available in the runtime. This allows the test-suite to
# remain importable in constrained environments while still providing a
# real httpx-backed session where available.
try:
    import httpx  # type: ignore

    _HAVE_HTTPX = True
except Exception:  # pragma: no cover - environment specific
    httpx = None  # type: ignore
    _HAVE_HTTPX = False


def _default_session(timeout: float = 10.0):
    if _HAVE_HTTPX:
        client = httpx.Client(timeout=timeout)

        def session(
            method: str,
            url: str,
            headers: Optional[Dict[str, str]] = None,
            params: Optional[Dict[str, Any]] = None,
            json: Optional[Dict[str, Any]] = None,
        ) -> Dict[str, Any]:
            # very small retry strategy for GET
            attempts = 3 if method.upper() == "GET" else 1
            delay = 0.1
            last_exc = None
            for _ in range(attempts):
                try:
                    resp = client.request(
                        method, url, headers=headers, params=params, json=json
                    )
                    return {
                        "status": resp.status_code,
                        "statusText": resp.reason_phrase,
                        "data": resp.json() if resp.content else {},
                    }
                except Exception as e:
                    last_exc = e
                    time.sleep(delay)
                    delay *= 2
            raise last_exc

        return session
    # fallback implementation using urllib.request to keep imports working in
    # constrained environments. This implementation does not support retries or
    # rich JSON parsing for all edge cases but is sufficient as a fallback.
    import urllib.error
    import urllib.request

    def session(
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        req = urllib.request.Request(url, method=method.upper())
        headers = headers or {}
        for k, v in headers.items():
            req.add_header(k, v)
        data = None
        if json_body is not None:
            data = json.dumps(json_body).encode("utf-8")
            req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, data=data, timeout=timeout) as resp:
                content = resp.read()
                text = content.decode("utf-8") if content else ""
                try:
                    parsed = json.loads(text) if text else {}
                except Exception:
                    parsed = {}
                return {
                    "status": resp.getcode(),
                    "statusText": resp.reason if hasattr(resp, "reason") else "",
                    "data": parsed,
                }
        except urllib.error.HTTPError as he:
            return {"status": he.code, "statusText": str(he), "data": {}}

    return session


# export a default session callable
default_session = _default_session()

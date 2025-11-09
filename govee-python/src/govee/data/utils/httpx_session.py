"""Simple httpx session wrapper with retry/backoff.

This wrapper provides a `session` callable compatible with the Request
helper's expected signature: session(method, url, headers=..., params=..., json=...).

It uses httpx under the hood and implements a basic retry loop with
exponential backoff for idempotent requests (GET). For simplicity and to
keep test speed reasonable, configuration is lightweight.
"""
from __future__ import annotations

import time
import httpx
from typing import Any, Dict, Optional


def _default_session(timeout: float = 10.0):
    client = httpx.Client(timeout=timeout)

    def session(method: str, url: str, headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None, json: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        # very small retry strategy for GET
        attempts = 3 if method.upper() == "GET" else 1
        delay = 0.1
        last_exc = None
        for _ in range(attempts):
            try:
                resp = client.request(method, url, headers=headers, params=params, json=json)
                return {"status": resp.status_code, "statusText": resp.reason_phrase, "data": resp.json() if resp.content else {}}
            except Exception as e:
                last_exc = e
                time.sleep(delay)
                delay *= 2
        raise last_exc

    return session


# export a default session callable
default_session = _default_session()


"""Lightweight HTTP request helper modeled after lib/data/utils/request.util.ts

This module provides a Request wrapper and a request() factory. It is
intentionally minimal: network calls are delegated to an injected session
callable for testability. The Request.post/get methods perform basic status
checks and optionally save response JSON to files.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional, Type, TypeVar

T = TypeVar("T")
logger = logging.getLogger(__name__)


@dataclass
class ApiResponseStatus:
    statusCode: int
    message: str


class ApiError(Exception):
    def __init__(self, message: str, status: ApiResponseStatus) -> None:
        super().__init__(message)
        self.status = status


class BaseRequest:
    pass


class BaseResponse:
    def __init__(self, **kwargs: Any) -> None:
        self.message = kwargs.get("message")
        self.msg = kwargs.get("msg")
        self.status = kwargs.get("status")


class Request:
    def __init__(
        self,
        url: str,
        headers: Dict[str, str],
        payload: Optional[Dict[str, Any]] = None,
        session: Optional[Callable[..., Dict[str, Any]]] = None,
    ) -> None:
        self.url = url
        self.headers = headers
        self.payload = payload
        self._session = session

    async def get(self, as_type: Optional[Type[T]] = None, save_to_file: Optional[str] = None) -> Dict[str, Any]:
        # Use session if provided, otherwise raise (callers should inject fake session in tests)
        if not self._session:
            raise RuntimeError("no session provided")
        resp = self._session(method="GET", url=self.url, headers=self.headers, params=self.payload)
        status = int(resp.get("status", 200))
        if status != 200:
            raise ApiError(resp.get("statusText", "HTTP error"), ApiResponseStatus(statusCode=status, message=resp.get("statusText", "")))
        data = resp.get("data", resp)
        if save_to_file:
            with open(save_to_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        if as_type is not None:
            # try to instantiate dataclass or class from dict
            if hasattr(as_type, "from_dict"):
                return as_type.from_dict(data)  # type: ignore[arg-type]
            return as_type(**data)  # type: ignore[misc]
        return data

    async def post(self, as_type: Optional[Type[T]] = None, save_to_file: Optional[str] = None) -> Dict[str, Any]:
        if not self._session:
            raise RuntimeError("no session provided")
        resp = self._session(method="POST", url=self.url, headers=self.headers, json=self.payload)
        # TS checks both HTTP status and embedded data.status
        http_status = int(resp.get("status", 200))
        if http_status != 200:
            raise ApiError(resp.get("statusText", "HTTP error"), ApiResponseStatus(statusCode=http_status, message=resp.get("statusText", "")))
        content = resp.get("data", resp)
        data_status = int(content.get("status", content.get("statusCode", 200)))
        if data_status != 200:
            raise ApiError(content.get("message", "Unexpected Error"), ApiResponseStatus(statusCode=data_status, message=content.get("message", "")))
        if save_to_file:
            with open(save_to_file, "w", encoding="utf-8") as f:
                json.dump(content, f, indent=2)
        if as_type is not None:
            if hasattr(as_type, "from_dict"):
                return as_type.from_dict(content)  # type: ignore[arg-type]
            return as_type(**content)  # type: ignore[misc]
        return content


from .async_http_session import default_async_session


def request(url: str, headers: Dict[str, str], payload: Optional[Dict[str, Any]] = None, session: Optional[Callable[..., Dict[str, Any]]] = None) -> Request:
    # if no session provided, use the default async session. We adapt the
    # coroutine-based session into a sync-friendly wrapper that exposes get/post
    # coroutines on the returned Request object.
    if session is None:
        async_session = default_async_session

        def session_wrapper(method: str, url: str, headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None, json_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
            import asyncio

            return asyncio.get_event_loop().run_until_complete(async_session(method=method, url=url, headers=headers, params=params, json=json_body))

        session = session_wrapper

    return Request(url, headers, payload, session=session)

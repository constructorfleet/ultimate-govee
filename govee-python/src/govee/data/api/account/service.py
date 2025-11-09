"""Minimal GoveeAccountService port used by translated domain code and tests.

This implements the subset of behavior exercised by the Python tests: token
validation, authentication flow that updates a persisted account store, and
AWS IoT certificate handling via a pluggable parse_p12_certificate helper.

Network calls are delegated to a `request` callable passed to the constructor
so tests can inject a fake request function.
"""
from __future__ import annotations

import base64
import json
import time
import logging
from typing import Optional, Callable, Dict, Any

from govee.persist.service import PersistService
from .models import GoveeAccount, OAuthData, IoTData
from .configuration import AUTH_URL, COMMUNITY_AUTH_URL, IOT_CERT_URL, REFRESH_TOKEN_URL


logger = logging.getLogger(__name__)


class GoveeAccountService:
    def __init__(
        self,
        persist: Optional[PersistService] = None,
        request: Optional[Callable[..., Any]] = None,
        parse_p12: Optional[Callable[[str, str], Dict[str, str]]] = None,
    ) -> None:
        self._persist = persist or PersistService("govee.accountClient.json")
        # request can be a convenience wrapper that delegates to the
        # govee.data.utils.request.request factory. If None, the factory's
        # default session will be used when the service performs network calls.
        from govee.data.utils.request import request as request_factory  # local import to avoid cycle

        # Support two invocation styles for tests and callers:
        # 1) request is a factory: request(url, headers, payload) -> Request
        # 2) request is a legacy session function: fn(url, headers=..., json=..., method=...)
        if request is None:
            self._request = request_factory
        else:
            # detect whether the provided callable looks like a factory (returns a Request)
            try:
                maybe = request(AUTH_URL, headers={}, payload={})
                # If the returned object has get/post, assume factory interface
                if hasattr(maybe, "get") and hasattr(maybe, "post"):
                    self._request = request
                else:
                    # wrap legacy session function into a factory-compatible callable
                    def _wrap(url, headers=None, payload=None):
                        class _LegacyReq:
                            def __init__(self, fn, url, headers, payload):
                                self._fn = fn
                                self._url = url
                                self._headers = headers or {}
                                self._payload = payload or {}

                            async def get(self):
                                return self._fn(self._url, headers=self._headers, json=self._payload, method="GET")

                            async def post(self):
                                return self._fn(self._url, headers=self._headers, json=self._payload, method="POST")

                        return _LegacyReq(request, url, headers, payload)

                    self._request = _wrap
            except Exception:
                # If calling request raised, fall back to assuming legacy signature
                def _wrap(url, headers=None, payload=None):
                    class _LegacyReq:
                        def __init__(self, fn, url, headers, payload):
                            self._fn = fn
                            self._url = url
                            self._headers = headers or {}
                            self._payload = payload or {}

                        async def get(self):
                            return self._fn(self._url, headers=self._headers, json=self._payload, method="GET")

                        async def post(self):
                            return self._fn(self._url, headers=self._headers, json=self._payload, method="POST")

                    return _LegacyReq(request, url, headers, payload)

                self._request = _wrap
        self._parse_p12 = parse_p12
        persisted = self._persist.load() or {}
        # simple dict -> dataclass mapping
        self._account = GoveeAccount(
            accountId=persisted.get("accountId", ""),
            clientId=persisted.get("clientId", ""),
            topic=persisted.get("topic", ""),
            oauth=OAuthData(**persisted["oauth"]) if persisted.get("oauth") else None,
            bffOAuth=OAuthData(**persisted["bffOAuth"]) if persisted.get("bffOAuth") else None,
            iot=IoTData(**persisted["iot"]) if persisted.get("iot") else None,
        )

    def is_token_valid(self, token: Optional[str]) -> bool:
        if not token:
            return False
        try:
            # naive JWT decode: split and decode payload
            parts = token.split(".")
            if len(parts) < 2:
                return False
            payload = parts[1]
            # pad base64
            payload += "=" * ((4 - len(payload) % 4) % 4)
            data = json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))
            exp = data.get("exp")
            iat = data.get("iat")
            if not exp or not iat:
                return False
            return time.time() < float(exp)
        except Exception as e:  # pragma: no cover - defensive
            logger.error("is_token_valid error: %s", e)
            return False

    async def refresh(self, oauth: OAuthData) -> OAuthData:
        # call the request factory which returns a Request object; use the
        # internal default session if no explicit session was provided.
        req = self._request(REFRESH_TOKEN_URL, headers={}, payload={})
        resp = await req.get()
        # resp may be a parsed model or dict; normalize
        data = resp.get("data", resp) if isinstance(resp, dict) else resp
        # emulate TS behaviour
        new = OAuthData(
            accessToken=data.get("token", ""),
            refreshToken=data.get("refreshToken", ""),
            expiresAt=int(time.time() * 1000) + int(data.get("tokenExpireCycle", 0)) * 1000,
            clientId=oauth.clientId,
        )
        return new

    async def authenticate(self, credentials: Dict[str, str]) -> GoveeAccount:
        # authenticate with govee REST
        if self._request is None:
            raise RuntimeError("no request implementation provided")
        # check persisted
        if self._account.oauth and self.is_token_valid(self._account.oauth.accessToken):
            logger.info("Using persisted Govee API credentials")
        else:
            req = self._request(AUTH_URL, headers={}, payload={
                "email": credentials.get("username"),
                "password": credentials.get("password"),
                "client": credentials.get("clientId", ""),
            })
            resp = await req.post()
            client = resp.get("data", resp).get("client", resp.get("client") if isinstance(resp, dict) else {})
            self._account.accountId = client.get("accountId", "")
            self._account.clientId = client.get("clientId", "")
            self._account.topic = client.get("topic", "")
            self._account.oauth = OAuthData(
                accessToken=client.get("accessToken", ""),
                refreshToken=client.get("refreshToken", ""),
                expiresAt=int(time.time() * 1000) + int(client.get("tokenExpireCycle", 0)) * 1000,
                clientId=client.get("clientId", ""),
            )
            self._persist.save(self._account.__dict__)

            # get iot cert
            req = self._request(IOT_CERT_URL, headers={}, payload={})
            iot_resp = await req.get()
            iot_data = iot_resp.get("data", iot_resp) if isinstance(iot_resp, dict) else iot_resp
            if self._parse_p12:
                cert = self._parse_p12(iot_data.get("p12", ""), iot_data.get("p12Pass", ""))
                self._account.iot = IoTData(
                    certificate=cert.get("certificate", ""),
                    privateKey=cert.get("privateKey", ""),
                    endpoint=iot_data.get("endpoint", iot_data.get("brokerUrl", "")),
                    accountId=self._account.accountId,
                    clientId=self._account.clientId,
                    topic=self._account.topic,
                )
                self._persist.save(self._account.__dict__)

        # authenticate with community API
        if self._account.bffOAuth and self.is_token_valid(self._account.bffOAuth.accessToken):
            logger.info("Using persisted Govee Community credentials")
        else:
            req = self._request(COMMUNITY_AUTH_URL, headers={}, payload={
                "email": credentials.get("username"),
                "password": credentials.get("password"),
            })
            resp = await req.post()
            community = resp.get("data", {}).get("community", {}) if isinstance(resp, dict) else getattr(resp, "community", {})
            self._account.bffOAuth = OAuthData(
                accessToken=community.get("token", ""),
                refreshToken="",
                expiresAt=int(community.get("expiresAt", 0)),
                clientId=self._account.clientId,
            )
            self._persist.save(self._account.__dict__)

        return self._account

"""Products API service minimal implementation."""

from __future__ import annotations

from typing import Any, Callable, Dict, Optional

from .configuration import PRODUCT_INFO_URL
from .models import Product


class ProductsApiService:
    def __init__(self, request: Optional[Callable[..., Any]] = None):
        # request factory should return a Request-like object (with async
        # get/post methods). By default use the request() factory which binds
        # the default async session.
        from govee.data.utils.request import request as request_factory

        self._request = request or request_factory

    async def _make_req(
        self,
        url: str,
        headers: Dict[str, Any],
        payload: Optional[Dict[str, Any]] = None,
    ):
        import inspect

        if inspect.iscoroutinefunction(self._request):
            return await self._request(url, headers, payload)
        return self._request(url, headers, payload)

    async def get_product_info(self, product_id: str) -> Product:
        # tolerate several possible response shapes; normalize into Product
        req = await self._make_req(
            PRODUCT_INFO_URL, headers={}, payload={"productId": product_id}
        )
        resp = await req.get()
        data: Dict[str, Any] = (
            resp.get("data", resp) if isinstance(resp, dict) else resp
        )

        # Some endpoints return {'data': {'product': {...}}}
        # Use the Product.from_raw helper to normalize.
        return Product.from_raw(product_id, data)

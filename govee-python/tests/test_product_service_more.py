import pytest

from govee.data.api.product import Product, ProductsApiService


class FakeReq:
    def __init__(self, resp):
        self._resp = resp

    async def get(self):
        return self._resp


@pytest.mark.asyncio
async def test_get_product_info_nested_product_key():
    def fake_factory(url, headers, payload=None):
        return FakeReq(
            {
                "data": {
                    "product": {
                        "id": payload.get("productId"),
                        "model": "X200",
                        "name": "Strip Light",
                        "specs": {"length": 2},
                    }
                }
            }
        )

    svc = ProductsApiService(request=fake_factory)
    p = await svc.get_product_info("p-42")
    assert isinstance(p, Product)
    assert p.id == "p-42"
    assert p.model == "X200"
    assert p.specs["length"] == 2


@pytest.mark.asyncio
async def test_get_product_info_flat_shape():
    def fake_factory(url, headers, payload=None):
        return FakeReq(
            {
                "data": {
                    "productId": payload.get("productId"),
                    "model": "B1",
                    "name": "Bulb",
                    "category": "lighting",
                }
            }
        )

    svc = ProductsApiService(request=fake_factory)
    p = await svc.get_product_info("p-b1")
    assert p.id == "p-b1"
    assert p.category == "lighting"


@pytest.mark.asyncio
async def test_get_product_handles_missing_fields_gracefully():
    # missing data or fields should not raise
    def fake_factory(url, headers, payload=None):
        return FakeReq({})

    svc = ProductsApiService(request=fake_factory)
    p = await svc.get_product_info("p-empty")
    assert p.id == "p-empty"
    assert p.name is None

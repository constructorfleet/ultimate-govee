import pytest

from govee.data.api.product import Product, ProductsApiService


def test_product_model_shape():
    p = Product(id="p-1", model="P100", name="Smart Bulb", specs={"watt": 9})
    assert p.id == "p-1"
    assert p.model == "P100"
    assert p.specs["watt"] == 9


@pytest.mark.asyncio
async def test_get_product_info_maps_response():
    class FakeReq:
        def __init__(self, resp):
            self._resp = resp

        async def get(self):
            return self._resp

    async def fake_factory(url, headers, payload=None):
        return FakeReq(
            {
                "data": {
                    "product": payload.get("productId"),
                    "model": "P100",
                    "name": "Smart Bulb",
                    "specs": {"watt": 9},
                }
            }
        )

    svc = ProductsApiService(request=fake_factory)

    p = await svc.get_product_info("p-1")
    assert isinstance(p, Product)
    assert p.id == "p-1"
    assert p.name == "Smart Bulb"

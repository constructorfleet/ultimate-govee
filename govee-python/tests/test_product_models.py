from govee.data.api.product.models import Product


def test_product_from_raw_with_flat_shape():
    raw = {
        "id": "p1",
        "model": "M1",
        "name": "Govee Thing",
        "category": "sensor",
        "images": {"thumb": "url"},
    }
    p = Product.from_raw("p1", raw)
    assert p.id == "p1"
    assert p.model == "M1"
    assert p.images["thumb"] == "url"


def test_product_from_raw_with_nested_product():
    raw = {"product": {"model": "M2", "name": "Nested"}}
    p = Product.from_raw("p2", raw)
    assert p.id == "p2"
    assert p.name == "Nested"


def test_product_from_raw_none_returns_minimal():
    p = Product.from_raw("p-empty", None)
    assert p.id == "p-empty"
    assert p.model is None

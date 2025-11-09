"""Product API models and service used by tests.

Minimal shapes for product information fetched from Govee product API.
"""

from .models import Product
from .service import ProductsApiService

__all__ = ["Product", "ProductsApiService"]

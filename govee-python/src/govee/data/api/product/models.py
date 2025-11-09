"""Product models."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class Product:
    """Represents a Govee product.

    This is intentionally generous with optional fields to mirror the
    variety of shapes returned by different API endpoints.
    """

    id: str
    model: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None
    images: Optional[Dict[str, str]] = None
    raw: Optional[Dict[str, Any]] = None

    @classmethod
    def from_raw(cls, id: str, raw: Optional[Dict[str, Any]]):
        if raw is None:
            return cls(id=id)
        # some APIs nest product under 'product' key; accept either.
        # Only treat the nested value as authoritative if it's a mapping.
        if (
            isinstance(raw, dict)
            and "product" in raw
            and isinstance(raw.get("product"), dict)
        ):
            data = raw.get("product")
        else:
            data = raw
        model = data.get("model") if isinstance(data, dict) else None
        name = data.get("name") if isinstance(data, dict) else None
        category = data.get("category") if isinstance(data, dict) else None
        specs = data.get("specs") if isinstance(data, dict) else None
        images = data.get("images") if isinstance(data, dict) else None
        return cls(
            id=id,
            model=model,
            name=name,
            category=category,
            specs=specs,
            images=images,
            raw=raw,
        )

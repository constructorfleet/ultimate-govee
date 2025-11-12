"""DeviceFactory implementation mirroring TypeScript DeviceFactory matching.

This class allows registering factories with matchers (category->group->pattern)
and creating device instances for a given product model dict. It is designed
to be compatible with the extracted TypeScript matchers used in parity tests.
"""
from __future__ import annotations

import re
from typing import Any, Callable, Dict, List, Optional


class DeviceFactory:
    factories: List["DeviceFactory"] = []

    def __init__(self, type_constructor: Callable[..., Any], matchers: Dict[str, Dict[str, Any]]):
        self.type_constructor = type_constructor
        # matchers: category -> { group: True | [{pattern, flags}] | {pattern,flags} | str }
        self.matchers = matchers
        DeviceFactory.factories.append(self)

    def matches(self, product: Dict[str, Any]) -> bool:
        category = product.get("category")
        group = product.get("group")
        model = product.get("modelName") or ""
        if not category or not group:
            return False
        cat_map = self.matchers.get(category)
        if not cat_map:
            return False
        grp_val = cat_map.get(group)
        if grp_val is True:
            return True
        if isinstance(grp_val, list):
            for reg in grp_val:
                if isinstance(reg, dict):
                    pat = reg.get("pattern")
                    flags = reg.get("flags", "")
                else:
                    pat = str(reg)
                    flags = ""
                try:
                    if "i" in (flags or "").lower():
                        if re.search(pat, model, re.IGNORECASE):
                            return True
                    else:
                        if re.search(pat, model):
                            return True
                except re.error:
                    if pat and pat.lower() in model.lower():
                        return True
            return False
        if isinstance(grp_val, dict):
            pat = grp_val.get("pattern")
            flags = grp_val.get("flags", "")
            try:
                if "i" in flags.lower():
                    return bool(re.search(pat, model, re.IGNORECASE))
                return bool(re.search(pat, model))
            except re.error:
                return bool(pat and pat.lower() in model.lower())
        if isinstance(grp_val, str):
            return grp_val.strip().lower() in model.lower()
        return False

    def create(self, product: Dict[str, Any], *args, **kwargs) -> Optional[Any]:
        if self.matches(product):
            return self.type_constructor(product, *args, **kwargs)
        return None

    @classmethod
    def create_for_product(cls, product: Dict[str, Any], *args, **kwargs) -> List[Any]:
        """Return instances from all factories that match the product."""
        out = []
        for f in cls.factories:
            inst = f.create(product, *args, **kwargs)
            if inst is not None:
                out.append(inst)
        return out


__all__ = ["DeviceFactory"]


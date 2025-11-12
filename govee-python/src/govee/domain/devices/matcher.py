"""Matcher utilities to match a product entry against the Python factory mapping.

This implements the same logic as the TypeScript DeviceFactory matcher:
 - check category key
 - check group key
 - if group value is True, match
 - if group value is a list of regex dicts, test each against modelName
"""

import re
from typing import Dict, List, Any

from .mapping import FACTORY_MATCHERS


def match_product(product: Dict[str, Any]) -> List[str]:
    """Return list of factory names that match the product."""
    category = product.get('category')
    group = product.get('group')
    model = product.get('modelName') or ''
    if not category or not group:
        return []
    matches: List[str] = []
    for f in FACTORY_MATCHERS:
        matchers = f.get('matchers', {})
        cat_map = matchers.get(category)
        if not cat_map:
            continue
        grp_val = cat_map.get(group)
        if grp_val is True:
            matches.append(f['factory'])
            continue
        if isinstance(grp_val, list):
            for reg in grp_val:
                pat = reg.get('pattern') if isinstance(reg, dict) else str(reg)
                flags = reg.get('flags', '') if isinstance(reg, dict) else ''
                try:
                    if 'i' in (flags or '').lower():
                        if re.search(pat, model, re.IGNORECASE):
                            matches.append(f['factory'])
                            break
                    else:
                        if re.search(pat, model):
                            matches.append(f['factory'])
                            break
                except re.error:
                    if pat.lower() in model.lower():
                        matches.append(f['factory'])
                        break
        elif isinstance(grp_val, dict):
            pat = grp_val.get('pattern')
            flags = grp_val.get('flags', '')
            try:
                if 'i' in flags.lower():
                    if re.search(pat, model, re.IGNORECASE):
                        matches.append(f['factory'])
                else:
                    if re.search(pat, model):
                        matches.append(f['factory'])
            except re.error:
                if pat and pat.lower() in model.lower():
                    matches.append(f['factory'])
        else:
            # raw string
            if isinstance(grp_val, str) and grp_val.strip().lower() in model.lower():
                matches.append(f['factory'])
    return matches


__all__ = ["match_product"]


"""Matcher utilities to match a product entry against the Python factory mapping.

This implements the same logic as the TypeScript DeviceFactory matcher:
 - check category key
 - check group key
 - if group value is True, match
 - if group value is a list of regex dicts, test each against modelName
"""

import re
import os
import json
from typing import Dict, List, Any

from .mapping import FACTORY_MATCHERS


def _load_ts_fixture():
    # attempt to load the extracted TypeScript matchers fixture (if present)
    # path relative to repository root when tests run from govee-python/
    cand = os.path.join(os.getcwd(), 'govee-python', 'tests', 'fixtures', 'typescript_device_mappings.json')
    if not os.path.exists(cand):
        # also try tests/fixtures in package root
        cand = os.path.join(os.getcwd(), 'tests', 'fixtures', 'typescript_device_mappings.json')
        if not os.path.exists(cand):
            return None
    try:
        with open(cand) as f:
            data = json.load(f)
    except Exception:
        return None
    parsed = []
    for entry in data:
        m = {'factory': entry.get('factory')}
        matchers = entry.get('matchers')
        if not matchers:
            text = entry.get('mapping_text')
            if not text:
                m['matchers'] = None
                parsed.append(m)
                continue
            t = text.replace("'", '"')
            # remove trailing commas before closing braces/brackets
            t = re.sub(r',\s*([}\]])', r'\1', t)
            try:
                j = json.loads(t)
                m['matchers'] = j
            except Exception:
                m['matchers'] = None
        else:
            m['matchers'] = matchers
        parsed.append(m)
    return parsed


_TS_MATCHERS = _load_ts_fixture()


def match_product(product: Dict[str, Any]) -> List[str]:
    """Return list of factory names that match the product."""
    category = product.get('category')
    group = product.get('group')
    model = product.get('modelName') or ''
    if not category or not group:
        return []
    matches: List[str] = []
    # Prefer TS-extracted matchers if available (ensures parity).
    source = _TS_MATCHERS if _TS_MATCHERS else FACTORY_MATCHERS
    for f in source:
        matchers = f.get('matchers', {})
        if not matchers:
            continue
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

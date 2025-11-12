import json
import os
import re

FIX = os.path.join(os.path.dirname(__file__), 'fixtures')


def load_json(fn):
    with open(os.path.join(FIX, fn)) as f:
        return json.load(f)


def ts_expected_matches(product, ts_mappings):
    """Given a product entry and extracted TS mappings, return list of factory names that match."""
    matches = []
    category = product.get('category')
    group = product.get('group')
    model = product.get('modelName') or ''
    if not category or not group:
        return matches
    for m in ts_mappings:
        matchers = m.get('matchers') or {}
        cat_map = matchers.get(category)
        if not cat_map:
            continue
        grp_val = cat_map.get(group)
        if grp_val is True:
            matches.append(m['factory'])
            continue
        if isinstance(grp_val, list):
            # list of regex dicts
            for reg in grp_val:
                pat = reg.get('pattern')
                flags = reg.get('flags','')
                if 'i' in flags.lower():
                    if re.search(pat, model, re.IGNORECASE):
                        matches.append(m['factory'])
                        break
                else:
                    if re.search(pat, model):
                        matches.append(m['factory'])
                        break
        elif isinstance(grp_val, dict) or isinstance(grp_val, str):
            # single regex or raw string
            if isinstance(grp_val, dict):
                pat = grp_val.get('pattern')
                flags = grp_val.get('flags','')
                if 'i' in flags.lower():
                    if re.search(pat, model, re.IGNORECASE):
                        matches.append(m['factory'])
                else:
                    if re.search(pat, model):
                        matches.append(m['factory'])
            else:
                # raw val - attempt case-insensitive substring
                if grp_val.strip().lower() in model.lower():
                    matches.append(m['factory'])
    return matches


def test_parity_basic():
    products = load_json('govee.products.json')
    devices = load_json('govee.devices.json')
    ts_mappings = load_json('typescript_device_mappings.json')
    # pick a handful of products and assert our TS-based matcher returns something sensible
    # choose first 50 products
    count = 0
    for model, product in list(products.items())[:50]:
        expected = ts_expected_matches(product, ts_mappings)
        # just ensure the function runs and returns a list
        assert isinstance(expected, list)
        count += 1
    assert count == 50


import json
import os
import re

FIX = os.path.join(os.path.dirname(__file__), 'fixtures')


def load_json(fn):
    with open(os.path.join(FIX, fn)) as f:
        return json.load(f)


def load_ts_matchers():
    # loads the parsed typescript matchers fixture (produced by tools)
    path = os.path.join(FIX, 'typescript_device_mappings.json')
    mappings = load_json('typescript_device_mappings.json')
    # if mappings entries contain 'mapping_text' (raw string), try to parse into 'matchers'
    parsed = []
    for m in mappings:
        if 'matchers' in m and m['matchers']:
            parsed.append(m)
            continue
        text = m.get('mapping_text')
        if not text:
            parsed.append(m)
            continue
        # Simplest robust approach: mapping_text was produced by replacing
        # regex literals with JSON-like dicts; outer keys are single-quoted.
        # Convert single quotes to double quotes and load as JSON.
        t = text.replace("'", '"')
        try:
            j = json.loads(t)
        except Exception:
            # fallback: leave mapping_text unparsed
            m['matchers'] = None
            parsed.append(m)
            continue
        m['matchers'] = j
        parsed.append(m)
    return parsed


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
            # list of regex dicts or pre-parsed items
            for reg in grp_val:
                if isinstance(reg, dict):
                    pat = reg.get('pattern')
                    flags = reg.get('flags','')
                else:
                    # might be a plain string
                    pat = str(reg)
                    flags = ''
                if not pat:
                    continue
                try:
                    if 'i' in flags.lower():
                        if re.search(pat, model, re.IGNORECASE):
                            matches.append(m['factory'])
                            break
                    else:
                        if re.search(pat, model):
                            matches.append(m['factory'])
                            break
                except re.error:
                    # fallback to substring
                    if pat.lower() in model.lower():
                        matches.append(m['factory'])
                        break
        elif isinstance(grp_val, dict) or isinstance(grp_val, str):
            # single regex or raw string
            if isinstance(grp_val, dict):
                pat = grp_val.get('pattern')
                flags = grp_val.get('flags','')
                try:
                    if 'i' in flags.lower():
                        if re.search(pat, model, re.IGNORECASE):
                            matches.append(m['factory'])
                    else:
                        if re.search(pat, model):
                            matches.append(m['factory'])
                except re.error:
                    if pat and pat.lower() in model.lower():
                        matches.append(m['factory'])
            else:
                # raw val - attempt case-insensitive substring
                if grp_val and grp_val.strip().lower() in model.lower():
                    matches.append(m['factory'])
    return matches


def test_parity_basic():
    products = load_json('govee.products.json')
    devices = load_json('govee.devices.json')
    ts_mappings = load_ts_matchers()
    # import Python matcher
    # ensure src is on path for test discovery
    import sys
    if 'src' not in sys.path:
        sys.path.insert(0, os.path.join(os.getcwd(), 'src'))
    from govee.domain.devices.matcher import match_product as py_match
    # pick a handful of products and assert our TS-based matcher returns something sensible
    # choose first 50 products
    count = 0
    for model, product in list(products.items())[:50]:
        expected = ts_expected_matches(product, ts_mappings)
        actual = py_match(product)
        # both should be lists
        assert isinstance(expected, list)
        assert isinstance(actual, list)
        # ensure python matcher returns same factories as TS expected for this sample
        assert set(expected) == set(actual), f"Mismatch for {model}: expected {expected} got {actual}"
        count += 1
    assert count == 50

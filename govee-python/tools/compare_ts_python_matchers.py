import json, os, re
import sys
sys.path.insert(0, 'src')
from govee.domain.devices.matcher import match_product as py_match

def load_json(path):
    with open(path) as f:
        return json.load(f)

FIX='govee-python/tests/fixtures'
products = load_json(os.path.join(FIX,'govee.products.json'))
ts_maps = load_json(os.path.join(FIX,'typescript_device_mappings.json'))

def ts_expected(product, ts_mappings):
    matches=[]
    category=product.get('category')
    group=product.get('group')
    model=product.get('modelName') or ''
    if not category or not group:
        return matches
    for m in ts_mappings:
        matchers = m.get('matchers')
        if not matchers:
            continue
        cat_map = matchers.get(category)
        if not cat_map:
            continue
        grp_val = cat_map.get(group)
        if grp_val is True:
            matches.append(m['factory'])
            continue
        if isinstance(grp_val, list):
            for reg in grp_val:
                if isinstance(reg, dict):
                    pat=reg.get('pattern'); flags=reg.get('flags','')
                else:
                    # string
                    pat=str(reg); flags=''
                try:
                    if 'i' in flags.lower():
                        if re.search(pat, model, re.IGNORECASE): matches.append(m['factory']); break
                    else:
                        if re.search(pat, model): matches.append(m['factory']); break
                except re.error:
                    if pat.lower() in model.lower(): matches.append(m['factory']); break
        elif isinstance(grp_val, dict):
            pat=grp_val.get('pattern'); flags=grp_val.get('flags','')
            try:
                if 'i' in flags.lower():
                    if re.search(pat, model, re.IGNORECASE): matches.append(m['factory'])
                else:
                    if re.search(pat, model): matches.append(m['factory'])
            except re.error:
                if pat and pat.lower() in model.lower(): matches.append(m['factory'])
        else:
            if isinstance(grp_val,str) and grp_val.strip().lower() in model.lower(): matches.append(m['factory'])
    return matches

mismatches=[]
for model, product in products.items():
    ts = ts_expected(product, ts_maps)
    py = py_match(product)
    if set(ts) != set(py):
        mismatches.append((model, ts, py, product.get('category'), product.get('group'), product.get('modelName')))

print('Total products:', len(products))
print('Mismatches:', len(mismatches))
for i,m in enumerate(mismatches[:50]):
    print(i+1, m)

# write to file
with open('govee-python/tests/fixtures/mismatch_report.json','w') as f:
    json.dump(mismatches,f,indent=2)
print('Wrote mismatch_report.json')

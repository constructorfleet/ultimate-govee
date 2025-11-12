#!/usr/bin/env python3
import os, re, json
root='../lib/domain/devices/impl'
results=[]
for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if not fn.endswith('.ts'):
            continue
        path=os.path.join(dirpath,fn)
        with open(path,'r',encoding='utf-8') as f:
            txt=f.read()
        if 'extends DeviceFactory' not in txt:
            continue
        m=re.search(r'export\s+class\s+(\w+)Factory', txt)
        factory_name=m.group(1)+'Factory' if m else None
        for sm in re.finditer(r'super\s*\(', txt):
            i=sm.end()
            comma_pos=txt.find(',', i)
            if comma_pos==-1:
                continue
            brace_pos=txt.find('{', comma_pos)
            if brace_pos==-1:
                continue
            depth=0
            j=brace_pos
            while j < len(txt):
                if txt[j]=='{':
                    depth+=1
                elif txt[j]=='}':
                    depth-=1
                    if depth==0:
                        break
                j+=1
            obj_text=txt[brace_pos:j+1]
            obj_text_clean=re.sub(r'/([^/]+)/i', r'"REGEX:\1:i"', obj_text)
            obj_text_clean=re.sub(r'/([^/]+)/', r'"REGEX:\1:"', obj_text_clean)
            results.append({
                'file': path,
                'factory': factory_name,
                'mapping': obj_text_clean,
            })
            break
os.makedirs('govee-python/tests/fixtures', exist_ok=True)
with open('govee-python/tests/fixtures/typescript_device_mappings.json','w',encoding='utf-8') as f:
    json.dump(results,f,indent=2)
print('Wrote govee-python/tests/fixtures/typescript_device_mappings.json with', len(results), 'entries')

#!/usr/bin/env python3
import os
import re
import json


def find_factories(root):
    out = []
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if not fn.endswith('.ts'):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, 'r', encoding='utf-8') as f:
                txt = f.read()
            if 'extends DeviceFactory' not in txt:
                continue
            # class name (e.g., "export class RGBICLightFactory extends DeviceFactory<...> {")
            cm = re.search(r'export\s+class\s+([A-Za-z0-9_]+Factory)\b', txt)
            factory = cm.group(1) if cm else fn
            # find the factory class block
            # locate the position where the factory class is declared
            class_decl = re.search(r'export\s+class\s+' + re.escape(factory) + r'\b[\s\S]*?\{', txt)
            if not class_decl:
                continue
            start = class_decl.end() - 1
            # find matching brace for class body
            depth = 0
            i = start
            class_end = None
            while i < len(txt):
                if txt[i] == '{':
                    depth += 1
                elif txt[i] == '}':
                    depth -= 1
                    if depth == 0:
                        class_end = i
                        break
                i += 1
            class_body = txt[start:class_end+1] if class_end else txt[start:]
            # find constructor and super call inside class body
            ctor = re.search(r'constructor\s*\([\s\S]*?\)\s*\{', class_body)
            search_area = class_body
            if ctor:
                cstart = ctor.end() - 1
                # find end of constructor by balancing braces
                depth2 = 0
                j = cstart
                ctor_end = None
                while j < len(class_body):
                    if class_body[j] == '{':
                        depth2 += 1
                    elif class_body[j] == '}':
                        depth2 -= 1
                        if depth2 == 0:
                            ctor_end = j
                            break
                    j += 1
                if ctor_end:
                    search_area = class_body[cstart:ctor_end+1]
            # find super(...) with an object literal as second arg
            m = re.search(r'super\s*\([^,]+,\s*(\{[\s\S]*?\})\s*\)\s*;', search_area)
            if m:
                obj = m.group(1)
                out.append({'file': path, 'factory': factory, 'mapping_text': obj})
    return out


def parse_mapping_text(obj_text):
    # find entries like 'Category': { 'Group': VALUE, ... },
    entries = {}
    # keep original text
    t = obj_text
    # regex to capture "'Category': { ... }"
    for m in re.finditer(r"['\"]([^'\"]+)['\"]\s*:\s*\{", t):
        cat = m.group(1)
        start = m.end() - 1
        # find matching brace for this category
        depth = 0
        i = start
        while i < len(t):
            if t[i] == '{':
                depth += 1
            elif t[i] == '}':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        inner = t[start+1:i]
        groups = {}
        # find group entries inside inner
        for gm in re.finditer(r"['\"]([^'\"]+)['\"]\s*:\s*([^,}]+)", inner):
            gname = gm.group(1)
            val = gm.group(2).strip()
            # detect true
            if re.fullmatch(r'true', val, re.IGNORECASE):
                groups[gname] = True
            # array of regexes
            elif val.startswith('['):
                # find all /.../i or /.../
                regs = re.findall(r'/([^/]+)/([iI]?)', val)
                groups[gname] = [{'pattern': r[0], 'flags': r[1]} for r in regs]
            else:
                # single regex like /.../i or /.../
                rm = re.match(r'/([^/]+)/([iI]?)', val)
                if rm:
                    groups[gname] = [{'pattern': rm.group(1), 'flags': rm.group(2)}]
                else:
                # fallback: plain word (e.g., / RGB / in some files may appear oddly). store raw
                    groups[gname] = val.strip()
        entries[cat] = groups
    return entries


def main():
    # assume script is executed from govee-python/; lib is at ../lib
    root = os.path.abspath(os.path.join(os.getcwd(), '..', 'lib', 'domain', 'devices', 'impl'))
    items = find_factories(root)
    out = []
    for it in items:
        parsed = parse_mapping_text(it['mapping_text'])
        out.append({'file': it['file'], 'factory': it['factory'], 'matchers': parsed})

    outpath = os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'typescript_device_mappings.json')
    os.makedirs(os.path.dirname(outpath), exist_ok=True)
    with open(outpath, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2)
    print('Wrote', outpath, 'with', len(out), 'entries')


if __name__ == '__main__':
    main()

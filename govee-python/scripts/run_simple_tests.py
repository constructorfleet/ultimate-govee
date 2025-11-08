#!/usr/bin/env python3
"""Simple test runner to execute test_*.py files without pytest.

This runner imports each test module under the 'tests' package and calls
callable attributes that start with 'test_'. It prints failures and exits
with non-zero code if any test fails.

Note: This is NOT a replacement for pytest but helps run tests in
restricted environments where pytest isn't available.
"""
import importlib.util
import os
import sys
import traceback

ROOT = os.path.dirname(os.path.dirname(__file__))
# Ensure the package source dir is on sys.path so tests can import `govee`.
SRC = os.path.join(ROOT, 'src')
if SRC not in sys.path:
    sys.path.insert(0, SRC)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

TEST_DIR = os.path.join(ROOT, 'tests')

failures = []

for fname in sorted(os.listdir(TEST_DIR)):
    if not fname.startswith('test_') or not fname.endswith('.py'):
        continue
    modname = fname[:-3]
    path = os.path.join(TEST_DIR, fname)
    spec = importlib.util.spec_from_file_location(modname, path)
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    except Exception as e:
        failures.append((modname, 'import', e, traceback.format_exc()))
        continue

    for attr in dir(mod):
        if not attr.startswith('test_'):
            continue
        fn = getattr(mod, attr)
        if callable(fn):
            try:
                fn()
            except AssertionError as e:
                failures.append((modname + '.' + attr, 'assert', e, traceback.format_exc()))
            except Exception as e:
                failures.append((modname + '.' + attr, 'error', e, traceback.format_exc()))

if failures:
    print('\nFAILED TESTS:')
    for name, kind, exc, tb in failures:
        print('---')
        print(name)
        print(kind)
        print(exc)
        print(tb)
    sys.exit(2)

print('All simple tests passed')

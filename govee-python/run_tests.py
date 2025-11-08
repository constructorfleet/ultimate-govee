#!/usr/bin/env python3
"""Lightweight test runner for environments without pytest.

This runner imports test modules from the tests/ directory and executes any
callable whose name starts with `test_`. It sets up PYTHONPATH to include
`govee-python/src` so the package under development can be imported.

It is intentionally minimal and used only to verify the small translated
package in CI environments where installing pytest is not possible.
"""
import os
import sys
import runpy
import importlib.util
import traceback

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
TESTS = os.path.join(ROOT, "tests")

sys.path.insert(0, SRC)

failures = []
num = 0

for fn in sorted(os.listdir(TESTS)):
    if not fn.startswith("test_") or not fn.endswith(".py"):
        continue
    path = os.path.join(TESTS, fn)
    modname = fn[:-3]
    try:
        spec = importlib.util.spec_from_file_location(modname, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
    except Exception:
        failures.append((modname, "import", traceback.format_exc()))
        continue
    # find test callables
    for name in dir(mod):
        if not name.startswith("test_"):
            continue
        obj = getattr(mod, name)
        if not callable(obj):
            continue
        num += 1
        try:
            obj()
        except AssertionError:
            failures.append((modname, name, traceback.format_exc()))
        except Exception:
            failures.append((modname, name, traceback.format_exc()))

print(f"Ran {num} tests, failures: {len(failures)}")
if failures:
    for mod, fn, tb in failures:
        print("-" * 60)
        print(f"Failure in {mod}.{fn}")
        print(tb)
    sys.exit(2)
else:
    print("All tests passed")
    sys.exit(0)

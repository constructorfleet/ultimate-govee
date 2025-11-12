"""Run a single test module file by importing and executing callables named
`test_*`. This is a lightweight helper used to validate individual test files
without running the whole suite.
"""

import importlib.util
import sys


def run(path: str) -> int:
    spec = importlib.util.spec_from_file_location("_single_test_module", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[func-returns-value]
    failures = 0
    for name in dir(mod):
        if not name.startswith("test_"):
            continue
        obj = getattr(mod, name)
        if not callable(obj):
            continue
        try:
            obj()
            print(f"PASS: {name}")
        except AssertionError as e:
            failures += 1
            print(f"FAIL: {name} -> {e}")
        except Exception as e:
            failures += 1
            print(f"ERROR: {name} -> {e}")
    return failures


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: run_single_test_module.py <path-to-test-file>")
        sys.exit(2)
    path = sys.argv[1]
    sys.exit(run(path))

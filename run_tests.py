import importlib.util, sys, types, traceback, os

def run_test_file(path):
    name = os.path.splitext(os.path.basename(path))[0]
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    failures = 0
    for attr in dir(mod):
        if attr.startswith('test_') and callable(getattr(mod, attr)):
            try:
                print(f"RUN {name}.{attr}")
                getattr(mod, attr)()
            except Exception:
                failures += 1
                print(f"FAIL {name}.{attr}")
                traceback.print_exc()
    return failures

if __name__ == '__main__':
    paths = sys.argv[1:] or []
    total=0
    for p in paths:
        total += run_test_file(p)
    if total:
        print(f"{total} tests failed")
        sys.exit(1)
    else:
        print("ALL OK")

import importlib.util
import sys
from pathlib import Path

# ensure package path
repo_root = Path(__file__).parent.resolve()
src_path = repo_root / 'govee-python' / 'src'
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

TEST_FILES = [
    'govee-python/tests/test_decoder_lib.py',
    'govee-python/tests/test_decoder_service.py',
]

failed = []
for tf in TEST_FILES:
    path = Path(tf)
    name = path.stem
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    except Exception as e:
        print(f'ERROR importing {tf}:', e)
        failed.append((tf, 'import', e))
        continue
    # run functions starting with test_
    for attr in dir(mod):
        if attr.startswith('test_'):
            fn = getattr(mod, attr)
            if callable(fn):
                try:
                    print(f'RUN {tf}::{attr}')
                    fn()
                except AssertionError as e:
                    print(f'FAIL {tf}::{attr} -> {e}')
                    failed.append((tf, attr, e))
                except Exception as e:
                    print(f'ERROR {tf}::{attr} -> {e}')
                    failed.append((tf, attr, e))

if not failed:
    print('\nALL TESTS PASSED')
    sys.exit(0)
else:
    print('\nSOME TESTS FAILED')
    for f in failed:
        print(f)
    sys.exit(2)

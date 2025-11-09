#!/usr/bin/env python3
"""Run format/lint checks and the lightweight test runner for govee-python.

This is a Python replacement for the repository root `all_checks` shell
script. It is invoked by the project's top-level uv script and ensures the
same behavior in environments where uv attempts to execute the file as a
Python module.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_PY = os.path.join(ROOT, "govee-python", ".venv", "bin", "python")
BLACK = os.path.join(ROOT, "govee-python", ".venv", "bin", "black")
ISORT = os.path.join(ROOT, "govee-python", ".venv", "bin", "isort")
RUFF = os.path.join(ROOT, "govee-python", ".venv", "bin", "ruff")

def run(cmd, env=None, check=True):
    print("+", " ".join(cmd))
    return subprocess.run(cmd, env=env, check=check)


def main():
    env = os.environ.copy()
    env["XDG_CACHE_HOME"] = os.path.join(ROOT, ".uv_cache")

    if os.path.isfile(BLACK) and os.access(BLACK, os.X_OK) and os.path.isfile(ISORT) and os.access(ISORT, os.X_OK) and os.path.isfile(RUFF) and os.access(RUFF, os.X_OK):
        print("running black --check...")
        run([BLACK, "--check", "govee-python"], env=env)
        print("running isort --check-only...")
        run([ISORT, "--check-only", "govee-python"], env=env)
        print("running ruff check...")
        run([RUFF, "check", "govee-python/src", "govee-python/tests"], env=env)
    else:
        print("format/lint tools not available in govee-python/.venv; skipping format_check")

    # Run tests: prefer pytest in the venv so we can run coverage checks. If
    # pytest isn't available, fall back to the lightweight run_tests.py
    # runner to preserve functionality in minimal environments.
    pytest_bin = os.path.join(ROOT, "govee-python", ".venv", "bin", "pytest")
    if os.path.isfile(pytest_bin) and os.access(pytest_bin, os.X_OK):
        print("running pytest with coverage checks...")
        # enforce a coverage gate; adjust threshold here if needed
        try:
            run([pytest_bin, "--maxfail=1", "--disable-warnings", "-q", "--cov=govee", "--cov-fail-under=90"], env=env)
        except subprocess.CalledProcessError:
            # pytest returned non-zero (failures or coverage); re-raise to
            # propagate the failure to CI
            raise
        return

    # fallback: run the lightweight test runner
    if os.path.isfile(VENV_PY) and os.access(VENV_PY, os.X_OK):
        run([VENV_PY, os.path.join(ROOT, "govee-python", "run_tests.py")], env=env)
    else:
        print("python interpreter not found in venv; attempting system python")
        run([sys.executable, os.path.join(ROOT, "govee-python", "run_tests.py")], env=env)


if __name__ == "__main__":
    main()

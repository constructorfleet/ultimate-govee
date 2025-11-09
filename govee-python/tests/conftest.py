# conftest for pytest: ensure package src directory is on sys.path
import sys
import os
_here = os.path.dirname(os.path.abspath(__file__))
_root = os.path.abspath(os.path.join(_here, '..', 'src'))
if _root not in sys.path:
    sys.path.insert(0, _root)

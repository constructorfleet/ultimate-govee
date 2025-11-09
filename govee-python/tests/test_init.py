import govee


def test_version_exists():
    assert hasattr(govee, "__version__")
    assert isinstance(govee.__version__, str)

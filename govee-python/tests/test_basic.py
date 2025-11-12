from govee import hello


def test_hello_default():
    assert hello() == "hello world"


def test_hello_name():
    assert hello("alice") == "hello alice"

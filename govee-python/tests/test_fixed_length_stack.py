from govee.fixed_length_stack import FixedLengthStack


def test_fixed_length_stack_basic():
    s = FixedLengthStack[int](2)
    assert s.size() == 0
    s.enstack(1)
    s.enstack(2)
    assert s.size() == 2
    assert s.peek() == 2
    s.enstack(3)
    # oldest (1) should be dropped
    assert s.size() == 2
    assert s.peek_all() == [3, 2]
    assert s.destack() == 3
    assert s.destack() == 2
    assert s.destack() is None


def test_fixed_length_stack_clear():
    s = FixedLengthStack[str](1)
    s.enstack("a")
    s.clear()
    assert s.size() == 0


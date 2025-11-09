from govee import FixedLengthStack


def test_stack_basic():
    s = FixedLengthStack[int](3)
    assert s.size() == 0
    s.enstack(1)
    s.enstack(2)
    s.enstack(3)
    assert s.size() == 3
    assert s.peek() == 3

    s.enstack(4)
    # oldest element (1) should be dropped
    assert s.size() == 3
    assert s.peek_all() == [4, 3, 2]

    assert s.destack() == 4
    assert s.size() == 2


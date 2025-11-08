from govee.utils import first, partition


def test_first_no_predicate():
    assert first([1, 2, 3]) == 1


def test_first_with_predicate():
    assert first([1, 2, 3], lambda x: x > 1) == 2


def test_partition():
    evens, odds = partition(range(6), lambda x: x % 2 == 0)
    assert evens == [0, 2, 4]
    assert odds == [1, 3, 5]


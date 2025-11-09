from govee import first, partition


def test_first_without_predicate():
    data = [1, 2, 3]
    assert first(data) == 1


def test_first_with_predicate():
    data = [1, 2, 3, 4]
    assert first(data, lambda x: x % 2 == 0) == 2


def test_partition_splits():
    data = list(range(6))
    evens, odds = partition(data, lambda x: x % 2 == 0)
    assert evens == [0, 2, 4]
    assert odds == [1, 3, 5]

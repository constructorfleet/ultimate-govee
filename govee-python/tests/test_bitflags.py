from govee import create_bitflags_enum


def test_create_bitflags_and_operations():
    flags = create_bitflags_enum(["A", "B", "C"])
    a = flags.A
    b = flags.B
    c = flags.C

    assert a.value == 1
    assert b.value == 2
    assert c.value == 4

    union = a.or_(b)
    assert union.value == 3
    assert union.has_flag(a)
    assert union.has_flag(b)
    assert not union.has_flag(c)

    combined = flags.union([a, c])
    assert combined.value == 5

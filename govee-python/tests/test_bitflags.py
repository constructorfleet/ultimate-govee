from govee.bitflags import create_bitflags_enum


def test_bitflags_basic():
    enums = create_bitflags_enum(["A", "B", "C"]) 
    assert enums.keys == ["A", "B", "C"]
    a = enums.A
    b = enums.B
    c = enums.C
    assert a.value == 1
    assert b.value == 2
    assert c.value == 4
    assert a.or_(b).value == 3
    assert enums.union([a, c]).value == 5
    assert a.has_flag(a)
    assert not a.has_flag(b)


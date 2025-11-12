from govee.domain.devices.states.temperature import parse_temperature


def test_parse_current_and_calibration_and_probes():
    p = {"tempc": 21.5, ".cal": 2, "tempc1": 22.1, "tempc2": 23.2}
    cur, cal, probes = parse_temperature(p)
    assert cur == 21.5
    assert cal == 2
    assert isinstance(probes, dict)
    assert probes[1] == 22.1


def test_parse_missing_values():
    cur, cal, probes = parse_temperature({})
    assert cur is None
    assert cal is None
    assert probes is None

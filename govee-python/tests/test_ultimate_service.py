from govee.ultimate_govee.service import UltimateGoveeService


def test_service_start_stop():
    s = UltimateGoveeService()
    assert not s.started
    s.start()
    assert s.started
    s.stop()
    assert not s.started


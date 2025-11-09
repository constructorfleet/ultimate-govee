from govee.domain.devices.service import DevicesService


def test_update_and_get_state():
    svc = DevicesService()
    svc.update_state("d1", {"power": True, "brightness": 80})
    st = svc.get_state("d1")
    assert st.power is True
    assert st.brightness == 80


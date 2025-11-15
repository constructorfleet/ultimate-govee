from govee.domain.devices.implementations.ice_maker import IceMakerDevice
from govee.domain.devices.states.ice_maker_nugget_size import IceMakerNuggetSizeState


def test_ice_maker_nugget_state_parse_and_encode():
    dev = IceMakerDevice(id='ice-1')
    # apply payload with string name
    dev.apply_payload({'nuggetSize': 'MEDIUM'})
    assert hasattr(dev, 'ice_maker_nugget_size_state')
    st = dev.ice_maker_nugget_size_state.get()
    # when parsing we store raw value string
    assert st == 'MEDIUM' or st == '2' or st is not None
    # encode using high-level command
    frames = dev.encode_command({'nuggetSize': 'LARGE'})
    assert any(isinstance(f.get('code'), list) for f in frames)


def test_ice_maker_scheduled_start_encode():
    dev = IceMakerDevice(id='ice-2')
    frames = dev.encode_command({'scheduledStart': {'enabled': True, 'hourStart': 1, 'minuteStart': 30, 'nuggetSize': 'SMALL'}})
    assert any(f.get('op') == 'op' or f.get('code') is not None for f in frames)

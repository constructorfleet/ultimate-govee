import pytest
from govee.domain.devices.states.ice_maker_nugget_size import IceMakerNuggetSizeState
from govee.domain.devices.states.ice_maker_status import IceMakerStatusState
from govee.domain.devices.states.ice_maker_basket_full import IceMakerBasketFull
from govee.domain.devices.states.ice_maker_water_empty import IceMakerWaterEmpty
from govee.domain.devices.states.ice_maker_make_ice import IceMakerMakingIceState
from govee.domain.devices.states.ice_maker_scheduled_start import IceMakerScheduledStart


def test_nugget_size_encode_opcodes():
    st = IceMakerNuggetSizeState(None)
    frames = st.encode({'nuggetSize': 'SMALL'})
    assert any(f.get('op') == 'op' and isinstance(f.get('code'), list) for f in frames)


def test_scheduled_start_encode_opcodes():
    st = IceMakerScheduledStart(None)
    frames = st.encode({'scheduledStart': {'enabled': True, 'hourStart': 23, 'minuteStart': 59, 'nuggetSize': 'MEDIUM'}})
    assert any(f.get('op') == 'op' and isinstance(f.get('code'), list) for f in frames)


def test_status_and_aux_states_parse():
    s = IceMakerStatusState(None)
    s.parse({'statusCode': 1})
    assert s.get() == 'MAKING_ICE'

    b = IceMakerBasketFull(None)
    b.parse({'basketFull': 1})
    assert b.get() is True

    w = IceMakerWaterEmpty(None)
    w.parse({'waterEmpty': 0})
    assert w.get() is False

from govee.test_utils import DummyState


def test_dummy_state_parse_and_set_state():
    d = DummyState()
    d.parse({"x": 1})
    assert d.parse_calls == [{"x": 1}]

    # set_state should record and optionally emit commands
    cmds = d.set_state({"emit": "on"})
    assert d.set_state_calls == [{"emit": "on"}]
    assert cmds == [{"cmd": "on"}]
    assert d.command_bus == [{"cmd": "on"}]

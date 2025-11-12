from govee.domain.devices.states.control_lock import (
    parse_control_lock, state_to_command_control_lock)


def test_parse_control_lock_from_op_and_state():
    assert parse_control_lock({'op': {'command': [[1]]}}) is True
    assert parse_control_lock({'op': {'command': [[0]]}}) is False
    assert parse_control_lock({'state': {'controlLock': True}}) is True


def test_state_to_command_control_lock():
    result = state_to_command_control_lock([5,4], True)
    assert 'command' in result and 'status' in result

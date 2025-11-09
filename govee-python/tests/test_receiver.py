"""Basic receiver tests placeholder.

These tests assert the receiver service module can be imported. Full
translation of the LAN receiver is out of scope for this task, but we
ensure module wiring is correct.
"""

from govee.data.lan.receiver import ReceiverService


def test_receiver_importable():
    # ensure the ReceiverService class is importable from the module
    assert callable(ReceiverService)

from govee.data.lan.receiver.socket import ReceiverSocket, DummySocket
from govee.data.lan.receiver.types import ReceiverState


def test_receiver_socket_bind_and_feed_message():
    # prepare a dummy socket that records on_message handler
    dummy = DummySocket()
    rs = ReceiverSocket(socket=dummy, config={"receiverPort": 38899, "bindAddress": "127.0.0.1"})

    seen = []

    def on_msg(ev):
        seen.append(ev)

    rs.message_bus.subscribe(on_msg)

    # bind should set state to LISTENING
    import asyncio

    async def _do_bind():
        await rs.bind()

    asyncio.get_event_loop().run_until_complete(_do_bind())

    assert rs.socket_state.getValue() == ReceiverState.LISTENING

    # simulate an incoming message
    payload = b'{"cmd":"report","model":"H6112","data":"{\\"mac\\":\\"AA:BB:CC\\"}"}'
    dummy.feed(payload, ("192.168.1.2", 38899))

    assert seen, "no message was published to message_bus"
    ev = seen[0]
    assert ev.remote_info[0] == "192.168.1.2"
    assert b"H6112" in ev.message

import asyncio

from govee.data.lan.receiver.service import ReceiverService
from govee.data.lan.receiver.socket import DummySocket


def test_receiver_service_parses_message():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    sock = DummySocket()
    svc = ReceiverService(socket=sock)

    received = []

    def on_msg(ev):
        received.append(ev)

    svc.on_message(on_msg)

    # start binds the socket asynchronously
    loop.run_until_complete(svc.start("127.0.0.1", 9999))

    # simulate an incoming datagram
    sock.feed(b"hello", ("1.2.3.4", 12345))

    assert len(received) == 1
    assert received[0].message == b"hello"
    assert received[0].remote_info[0] == "1.2.3.4"


from govee.data.lan.sender.socket import DummySocket, SenderSocket


def test_sender_socket_send_and_bind():
    dummy = DummySocket()
    ss = SenderSocket(config={"bindAddress": "127.0.0.1"}, socket=dummy)

    # bind should set state to BOUND (or at least not error)
    import asyncio

    async def _do_bind():
        await ss.bind()

    asyncio.get_event_loop().run_until_complete(_do_bind())

    # simulate send
    called = []

    async def _do_send():
        await ss.send(b"hello", 38899, "192.168.1.2")
        called.append(True)

    asyncio.get_event_loop().run_until_complete(_do_send())

    assert called, "send did not complete"

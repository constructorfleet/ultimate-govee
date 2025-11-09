from govee.data.lan.receiver import parse_lan_packet


def test_parse_simple_lan_packet():
    # realistic sample taken from persisted fixtures (trimmed)
    raw = b'{"cmd":"report","model":"H6112","data":"{"mac":"AA:BB:CC:DD:EE:FF","ip":"192.168.1.5","port":"38899"}"}'
    parsed = parse_lan_packet(raw)
    assert parsed["cmd"] == "report"
    assert parsed["model"] == "H6112"
    assert parsed["data"]["mac"] == "AA:BB:CC:DD:EE:FF"

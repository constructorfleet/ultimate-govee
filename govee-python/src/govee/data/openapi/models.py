from __future__ import annotations

from typing import TypedDict


class IoTCredentialModel(TypedDict):
    certificate: str
    privateKey: str
    endpoint: str
    accountId: str
    clientId: str
    topic: str


def parse_iot_credentials(obj: dict) -> IoTCredentialModel:
    data = obj.get("data", obj)
    return {
        "certificate": data.get("certificate", ""),
        "privateKey": data.get("privateKey", ""),
        "endpoint": data.get("endpoint", ""),
        "accountId": data.get("accountId", ""),
        "clientId": data.get("clientId", ""),
        "topic": data.get("topic", ""),
    }

"""IoT certificate response model."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class IoTCertificateData:
    brokerUrl: str
    p12Certificate: str
    certificatePassword: str

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "IoTCertificateData":
        return IoTCertificateData(
            brokerUrl=d.get("brokerUrl", d.get("endpoint", d.get("brokerUrl", ""))),
            p12Certificate=d.get("p12", d.get("p12Certificate", "")),
            certificatePassword=d.get("p12Pass", d.get("certificatePassword", "")),
        )


@dataclass
class IoTCertificateResponse:
    iotData: IoTCertificateData

    @staticmethod
    def from_dict(d: Dict[str, Any]) -> "IoTCertificateResponse":
        return IoTCertificateResponse(
            iotData=IoTCertificateData.from_dict(d.get("data", {}))
        )

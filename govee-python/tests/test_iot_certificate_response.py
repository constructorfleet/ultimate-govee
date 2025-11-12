from govee.data.api.account.iot_certificate_response import (
    IoTCertificateData, IoTCertificateResponse)


def test_iot_certificate_standard_keys():
    # realistic-looking values coming from the API
    payload = {
        "data": {
            "brokerUrl": "ssl://iot-broker.govee.com:8883",
            "p12": "base64-encoded-p12-bytes...",
            "p12Pass": "s3cr3t-password",
        }
    }

    resp = IoTCertificateResponse.from_dict(payload)
    assert isinstance(resp.iotData, IoTCertificateData)
    assert resp.iotData.brokerUrl == "ssl://iot-broker.govee.com:8883"
    assert resp.iotData.p12Certificate.startswith("base64-encoded-p12")
    assert resp.iotData.certificatePassword == "s3cr3t-password"


def test_iot_certificate_alternate_keys():
    # Some API variants use alternative field names. The model should accept them.
    payload = {
        "data": {
            "endpoint": "mqtts://alternate-endpoint:443",
            "p12Certificate": "alt-p12-data",
            "certificatePassword": "alt-pass",
        }
    }

    resp = IoTCertificateResponse.from_dict(payload)
    assert resp.iotData.brokerUrl == "mqtts://alternate-endpoint:443"
    assert resp.iotData.p12Certificate == "alt-p12-data"
    assert resp.iotData.certificatePassword == "alt-pass"


def test_iot_certificate_missing_data_uses_defaults():
    # When the top-level data key is missing, the implementation should fall
    # back to an empty dict and produce empty strings for fields.
    resp = IoTCertificateResponse.from_dict({})
    assert resp.iotData.brokerUrl == ""
    assert resp.iotData.p12Certificate == ""
    assert resp.iotData.certificatePassword == ""


def test_iot_certificate_data_none_raises_attribute_error():
    # If the API explicitly sets data to None, the current implementation
    # will attempt to call .get on None which should raise an AttributeError.
    try:
        IoTCertificateResponse.from_dict({"data": None})
        raised = False
    except AttributeError:
        raised = True

    assert raised, "expected AttributeError when data is None"

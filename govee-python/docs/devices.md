DeviceBase API and device implementation examples

This document describes the minimal DeviceBase API used by domain device
implementations in govee-python and provides short examples for common
implementations (RGB, RGBIC, WhiteTemp, Sensor).

DeviceBase

- Class: govee.domain.devices.device_base.DeviceBase
- Purpose: common base class for concrete device implementations. It
  provides:
  - apply_payload(payload: Dict[str, Any]) -> None
    - Default implementation parses incoming payload into a DeviceState by
      calling govee.domain.devices.models.parse_state(payload) and stores
      the result on self._state.
  - get_state() -> DeviceState
    - Returns the last parsed DeviceState instance.
  - encode_command(command: Dict[str, Any]) -> List[Dict[str, Any]]
    - Default implementation encodes common fields (power, brightness)
      into frames. Concrete implementations should extend this and add
      device-specific frames (e.g., 'seg' for RGBIC, 'ct' for color temp).

DeviceState

- Class: govee.domain.devices.models.DeviceState
- Use: parse_state(payload) returns a DeviceState with normalized fields
  including power, brightness, color_temp, temperature, temperature_calibration,
  temp_probes, battery, humidity, effect, etc.

Implementing a device

1. Create an implementation module under
   govee.domain.devices.implementations.
2. Subclass DeviceBase and override apply_payload/encode_command as
   needed. Use parse_state to normalize incoming payloads and rely on
   DeviceBase.get_state() for test assertions.

Example: WhiteTempDevice

- Handles power, brightness and color temperature.
- encode_command should emit frames like:
  - {'op': 'power', 'v': 1}
  - {'op': 'bright', 'v': 50}
  - {'op': 'ct', 'v': 3000}

Example: RGBICDevice (addressable strip)

- Stores a segments list and encodes segment-level frames:
  - {'op': 'seg', 'index': 0, 'r': 255, 'g': 0, 'b': 0}
- apply_payload should normalize incoming 'segments' shapes into a
  predictable list on the instance.

Example: SensorDevice

- Reads battery, temperature and humidity from payload; typically does
  not encode commands (returns an empty list).

Factory integration

- The device factory (govee.domain.devices.factory.make_device_from_advert)
  maps model name heuristics to concrete implementations. To add a new
  implementation, update the factory mapping for models that should
  construct it.

Testing

- Tests should construct concrete instances and exercise apply_payload,
  get_state and encode_command to assert normalized state and encoded
  frames. Integration tests can publish encoded frames via the
  MQTTAdapter (using FakeMQTTBackend fixtures) to exercise the IoT
  pipeline.


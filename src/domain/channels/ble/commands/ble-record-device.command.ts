import { Labelled } from '@govee/common';
import { Device } from '../../../devices';

export class BleRecordDeviceCommand implements Labelled {
  label = () => `BLE Record Device: ${this.device.id}`;

  constructor(readonly device: Device) {}
}

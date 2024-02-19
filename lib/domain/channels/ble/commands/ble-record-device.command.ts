import { Labelled } from '~ultimate-govee-common';
import { Device } from '../../../devices/device';

export class BleRecordDeviceCommand implements Labelled {
  label = () => `BLE Record Device: ${this.device.id}`;

  constructor(readonly device: Device) {}
}

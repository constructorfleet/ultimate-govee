import { Labelled } from '@govee/common';
import { Device } from '../../device';

export class DeviceUpdatedEvent implements Labelled {
  label = () => `Device ${this.device.id} updated`;
  constructor(readonly device: Device) {}
}

import { Labelled } from '@govee/common';
import { Device } from '../../device';

export class DeviceDiscoveredEvent implements Labelled {
  label = () =>
    `New ${this.device.constructor.name} Discovered: ${this.device.name}`;
  constructor(readonly device: Device) {}
}

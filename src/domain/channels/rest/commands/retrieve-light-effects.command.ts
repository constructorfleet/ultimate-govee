import { Labelled } from '@govee/common';
import { Device } from '@govee/domain/devices/device';

export class RetrieveLightEffectsCommand implements Labelled {
  label = () => `Retrieve Light Effects for ${this.device.name}`;
  constructor(readonly device: Device) {}
}

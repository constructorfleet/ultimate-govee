import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { Device } from '@constructorfleet/ultimate-govee/domain/devices/device';

export class RetrieveLightEffectsCommand implements Labelled {
  label = () => `Retrieve Light Effects for ${this.device.name}`;
  constructor(readonly device: Device) {}
}

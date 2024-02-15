import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { GoveeDevice } from '@constructorfleet/ultimate-govee/data';

export class LinkDeviceProductCommand implements Labelled {
  label = () => `Link Product to ${this.device.id}`;

  constructor(readonly device: GoveeDevice) {}
}

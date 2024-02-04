import { Labelled } from '@govee/common';
import { GoveeDevice } from '@govee/data';

export class LinkDeviceProductCommand implements Labelled {
  label = () => `Link Product to ${this.device.id}`;

  constructor(readonly device: GoveeDevice) {}
}

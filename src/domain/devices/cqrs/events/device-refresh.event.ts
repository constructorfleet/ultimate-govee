import { Labelled } from '@govee/common';

export class DeviceRefeshEvent implements Labelled {
  label = () => `Refreshing ${this.device}`;

  constructor(readonly device) {}
}

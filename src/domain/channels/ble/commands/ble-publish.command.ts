import { Labelled } from '@govee/common';

export class BlePublishCommand implements Labelled {
  label = () => `BLE Publishing commands to ${this.id}`;

  constructor(
    readonly id: string,
    readonly bleAddress: string,
    readonly commands: number[][],
  ) {}
}

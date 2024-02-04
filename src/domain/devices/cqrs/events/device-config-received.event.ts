import { Labelled } from '@govee/common';
import { GoveeDevice, Product } from '@govee/data';

export class DeviceConfigReceivedEvent implements Labelled {
  label = () => `Device Config Received For ${this.deviceConfig.id}`;

  constructor(
    readonly deviceConfig: GoveeDevice,
    readonly product?: Product,
  ) {}
}

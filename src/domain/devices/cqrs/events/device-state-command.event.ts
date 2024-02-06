import { Labelled } from '@govee/common';
import { GoveeDeviceCommand } from '@govee/data';

export type DeviceCommandAddresses = {
  iotTopic?: string;
  bleAddress?: string;
};

export class DeviceStateCommandEvent implements Labelled {
  label = () => `State ${this.stateName}`;

  constructor(
    readonly stateName: string,
    readonly command: GoveeDeviceCommand,
    readonly addresses: DeviceCommandAddresses,
  ) {}
}

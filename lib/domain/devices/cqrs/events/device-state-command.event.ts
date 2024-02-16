import {
  DeviceCommandAddresses,
  DeviceId,
  Labelled,
} from '@constructorfleet/ultimate-govee/common';
import { GoveeDeviceCommand } from '@constructorfleet/ultimate-govee/data';

export class DeviceStateCommandEvent implements Labelled {
  label = () => `State ${this.stateName}`;

  constructor(
    readonly id: DeviceId,
    readonly stateName: string,
    readonly command: GoveeDeviceCommand,
    readonly addresses: DeviceCommandAddresses,
  ) {}
}

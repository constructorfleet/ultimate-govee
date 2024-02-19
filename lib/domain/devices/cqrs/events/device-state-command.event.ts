import {
  Debuggable,
  DeviceCommandAddresses,
  DeviceId,
  Labelled,
} from '~ultimate-govee-common';
import { GoveeDeviceCommand } from '~ultimate-govee-data';

export class DeviceStateCommandEvent implements Labelled, Debuggable {
  label = () => `State ${this.stateName}`;

  constructor(
    readonly id: DeviceId,
    readonly stateName: string,
    readonly command: GoveeDeviceCommand,
    readonly addresses: DeviceCommandAddresses,
    readonly debug?: boolean,
  ) {}
}

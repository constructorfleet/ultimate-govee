import { DeviceId, Labelled } from '~ultimate-govee-common';
import { GoveeDeviceStatus } from '~ultimate-govee-data';

export class UpdateDeviceStatusCommand implements Labelled {
  label = () => `Update ${this.deviceId} Status`;

  constructor(
    readonly deviceId: DeviceId,
    readonly status: GoveeDeviceStatus,
  ) {}
}

import { DeviceId, Labelled } from '@constructorfleet/ultimate-govee/common';
import { GoveeDeviceStatus } from '@constructorfleet/ultimate-govee/data';

export class UpdateDeviceStatusCommand implements Labelled {
  label = () => `Update ${this.deviceId} Status`;

  constructor(
    readonly deviceId: DeviceId,
    readonly status: GoveeDeviceStatus,
  ) {}
}

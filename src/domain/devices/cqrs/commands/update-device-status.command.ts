import { DeviceId, Labelled } from '@govee/common';
import { GoveeDeviceStatus } from '@govee/data';

export class UpdateDeviceStatusCommand implements Labelled {
  label = () => `Update ${this.deviceId} Status`;

  constructor(
    readonly deviceId: DeviceId,
    readonly status: GoveeDeviceStatus,
  ) {}
}

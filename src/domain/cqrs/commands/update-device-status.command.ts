import { GoveeDeviceStatus } from '@govee/data';

export class UpdateDeviceStatusCommand {
  constructor(
    readonly deviceId: string,
    readonly status: GoveeDeviceStatus,
  ) {}
}

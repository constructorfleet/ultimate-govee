import { Labelled } from '@govee/common';
import { GoveeDeviceStatus } from '@govee/data';

export class DeviceStatusReceivedEvent implements Labelled {
  label = () =>
    `Received status for ${this.deviceStatus.id} ${JSON.stringify(this.deviceStatus)}`;
  constructor(readonly deviceStatus: GoveeDeviceStatus) {}
}

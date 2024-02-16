import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { GoveeDeviceStatus } from '@constructorfleet/ultimate-govee/data';
import stringify from 'json-stringify-safe';

export class DeviceStatusReceivedEvent implements Labelled {
  label = () =>
    `Received status for ${this.deviceStatus.id} ${stringify(this.deviceStatus)}`;
  constructor(readonly deviceStatus: GoveeDeviceStatus) {}
}

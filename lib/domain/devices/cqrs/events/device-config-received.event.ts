import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { GoveeDevice } from '@constructorfleet/ultimate-govee/data';

export class DeviceConfigReceivedEvent implements Labelled {
  label = () => `Device Config Received For ${this.deviceConfig.id}`;

  constructor(readonly deviceConfig: GoveeDevice) {}
}

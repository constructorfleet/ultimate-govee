import { DeviceId, Labelled } from '@constructorfleet/ultimate-govee/common';

export class GetDeviceQuery implements Labelled {
  label = () => `Get ${this.deviceId}`;

  constructor(readonly deviceId: DeviceId[]) {}
}

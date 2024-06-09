import { Labelled, DeviceId } from '~ultimate-govee-common';

export class RefreshDeviceCommand implements Labelled {
  label = () => `Refresh device ${this.deviceId}`;
  constructor(readonly deviceId: DeviceId) {}
}

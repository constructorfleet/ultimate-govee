import { Labelled, Optional } from '@govee/common';

export class DeviceRefeshEvent implements Labelled {
  label = () => `Refreshing ${this.deviceId}`;

  constructor(
    readonly deviceId: string,
    readonly model: string,
    readonly goodsType: number,
    readonly iotTopic?: Optional<string>,
  ) {}
}

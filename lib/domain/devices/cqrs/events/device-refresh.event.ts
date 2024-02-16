import {
  DeviceCommandAddresses,
  Labelled,
} from '@constructorfleet/ultimate-govee/common';

export class DeviceRefeshEvent implements Labelled {
  label = () => `Refreshing ${this.deviceId}`;

  constructor(
    readonly deviceId: string,
    readonly model: string,
    readonly goodsType: number,
    readonly addresses: DeviceCommandAddresses,
    readonly opIdentifiers?: number[][],
  ) {}
}

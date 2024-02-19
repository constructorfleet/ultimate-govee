import {
  Debuggable,
  DeviceCommandAddresses,
  Labelled,
} from '~ultimate-govee/common';

export class DeviceRefeshEvent implements Labelled, Debuggable {
  label = () => `Refreshing ${this.deviceId}`;

  constructor(
    readonly deviceId: string,
    readonly model: string,
    readonly goodsType: number,
    readonly addresses: DeviceCommandAddresses,
    readonly opIdentifiers?: number[][],
    readonly debug?: boolean,
  ) {}
}

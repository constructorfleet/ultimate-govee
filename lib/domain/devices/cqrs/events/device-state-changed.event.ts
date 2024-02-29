import { Debuggable } from '~ultimate-govee-common';
import { Device } from '../../device';
import { DeviceStatesType } from '../../devices.types';

export class DeviceStateChangedEvent implements Debuggable {
  constructor(
    readonly device: Device<DeviceStatesType>,
    readonly state: string,
    readonly value: any,
    readonly commandId?: string,
    readonly debug?: boolean,
  ) {}
}

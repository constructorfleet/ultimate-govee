import { Debuggable } from '~ultimate-govee-common';
import { Device } from '../../device';
import { DeviceStates } from '../../devices.types';

export class DeviceStateChangedEvent implements Debuggable {
  constructor(
    readonly device: Device<DeviceStates>,
    readonly state: string,
    readonly value: any,
    readonly commandId?: string,
    readonly debug?: boolean,
  ) {}
}

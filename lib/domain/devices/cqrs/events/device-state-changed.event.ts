import { Debuggable } from '@constructorfleet/ultimate-govee/common';
import { Device } from '../../device';

export class DeviceStateChangedEvent implements Debuggable {
  constructor(
    readonly device: Device,
    readonly state: string,
    readonly value: any,
    readonly commandId?: string,
    readonly debug?: boolean,
  ) {}
}

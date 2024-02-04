import { Device } from '../../device';

export class DeviceStateChangedEvent {
  constructor(
    readonly device: Device,
    readonly state: string,
    readonly value: any,
  ) {}
}

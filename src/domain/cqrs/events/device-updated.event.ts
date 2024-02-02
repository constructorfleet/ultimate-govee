import { Device } from '../../devices/types/device';

export class DeviceUpdatedEvent {
  constructor(readonly device: Device) {}
}

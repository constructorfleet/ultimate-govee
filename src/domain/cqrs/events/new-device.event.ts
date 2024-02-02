import { Device } from '../../devices/types/device';

export class NewDeviceEvent {
  constructor(readonly device: Device) {}
}

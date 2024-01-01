import { Injectable } from '@nestjs/common';
import { DeviceModel } from '../models';

@Injectable()
export class DeviceStore {
  private readonly devices: Record<string, DeviceModel> = {};

  set(device: DeviceModel) {
    this.devices[device.id] = device;
  }

  get(deviceId: string) {
    return this.devices[deviceId];
  }
}

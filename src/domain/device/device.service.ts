import { Injectable } from '@nestjs/common';
import { DeviceStore } from './device.store';

@Injectable()
export class DeviceService {
  constructor(private readonly store: DeviceStore) {}
}

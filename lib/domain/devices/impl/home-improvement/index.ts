import { Type } from '@nestjs/common';
import { Device } from '../../device';
import {
  Devices as AirQualityDevices,
  DeviceStates as AirQualityStates,
} from './air-quality';
import {
  Devices as HygrometerDevices,
  DeviceStates as HygrometerStates,
} from './air-quality';

export * from './home-improvement.factory';
export * from './home-improvement.module';

export const Devices: Type<Device>[] = [
  ...AirQualityDevices,
  ...HygrometerDevices,
];
export const DeviceStates: string[] = [
  ...AirQualityStates,
  ...HygrometerStates,
];

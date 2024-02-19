import { Type } from '@nestjs/common';
import { Device } from '../../device';
import { AirQualityStates } from './air-quality/index';
import { HygrometerStates } from './hygrometer/index';
import {
  Devices as AirQualityDevices,
  DeviceStates as AirQualityDeviceStates,
} from './air-quality';
import {
  Devices as HygrometerDevices,
  DeviceStates as HygrometerDeviceStates,
} from './air-quality';

export * from './home-improvement.factory';
export * from './home-improvement.module';
export { AirQualityStates, HygrometerStates };
export const Devices: Type<Device>[] = [
  ...AirQualityDevices,
  ...HygrometerDevices,
];
export const DeviceStates: string[] = [
  ...AirQualityDeviceStates,
  ...HygrometerDeviceStates,
];

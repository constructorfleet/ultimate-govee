import { Type } from '@nestjs/common';
import { Device } from '../../device';
import { AirQualitySensor } from './air-quality/air-quality';
import { HygrometerSensor } from './hygrometer/hygrometer';
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
export { AirQualitySensor, HygrometerSensor };
export const Devices: Type<Device>[] = [
  ...AirQualityDevices,
  ...HygrometerDevices,
];
export const DeviceStates: string[] = [
  ...AirQualityDeviceStates,
  ...HygrometerDeviceStates,
];

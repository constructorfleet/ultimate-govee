import { Type } from '@nestjs/common';
import {
  Devices as RGBLightDevices,
  DeviceStates as RGBLightDeviceStates,
} from './rgb';
import {
  Devices as RGBICLightDevices,
  DeviceStates as RGBICLightDeviceStates,
} from './rgbic';
import { Device } from '../../device';
import { RGBLightStates } from './rgb/index';
import { RGBICLightStates } from './rgbic/index';
export * from './lights.factory';
export * from './lights.module';

export { RGBLightStates, RGBICLightStates };
export const Devices: Type<Device>[] = [
  ...RGBICLightDevices,
  ...RGBLightDevices,
];
export const DeviceStates: string[] = [
  ...RGBICLightDeviceStates,
  ...RGBLightDeviceStates,
];

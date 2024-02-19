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
import { RGBLight } from './rgb/rgb-light';
import { RGBICLight } from './rgbic/rgbic-light';
export * from './lights.factory';
export * from './lights.module';

export { RGBLight, RGBICLight };
export const Devices: Type<Device>[] = [
  ...RGBICLightDevices,
  ...RGBLightDevices,
];
export const DeviceStates: string[] = [
  ...RGBICLightDeviceStates,
  ...RGBLightDeviceStates,
];

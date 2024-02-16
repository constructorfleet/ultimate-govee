import { Type } from '@nestjs/common';
import {
  Devices as IceMakerDevices,
  DeviceStates as IceMakerStates,
} from './ice-maker';
import { Device } from '../../device';
import {
  Devices as HumidifierDevices,
  DeviceStates as HumidifierStates,
} from './humidifier';
import {
  Devices as PurifierDevices,
  DeviceStates as PurifierStates,
} from './purifier';
export * from './appliances.factory';
export * from './appliances.module';

export const Devices: Type<Device>[] = [
  ...IceMakerDevices,
  ...HumidifierDevices,
  ...PurifierDevices,
];
export const DeviceStates: string[] = [
  ...IceMakerStates,
  ...HumidifierStates,
  ...PurifierStates,
];

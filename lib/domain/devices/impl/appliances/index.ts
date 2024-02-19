import { Type } from '@nestjs/common';
import {
  Devices as IceMakerDevices,
  DeviceStates as IceMakerDeviceStates,
} from './ice-maker';
import { Device } from '../../device';
import { PurifierStates } from './purifier/index';
import { HumidifierStates } from './humidifier/index';
import { IceMakerStates } from './ice-maker/index';
import {
  Devices as HumidifierDevices,
  DeviceStates as HumidifierDeviceStates,
} from './humidifier';
import {
  Devices as PurifierDevices,
  DeviceStates as PurifierDeviceStates,
} from './purifier';

export * from './appliances.factory';
export * from './appliances.module';
export { PurifierStates, HumidifierStates, IceMakerStates };

export const Devices: Type<Device>[] = [
  ...IceMakerDevices,
  ...HumidifierDevices,
  ...PurifierDevices,
];
export const DeviceStates: string[] = [
  ...IceMakerDeviceStates,
  ...HumidifierDeviceStates,
  ...PurifierDeviceStates,
];

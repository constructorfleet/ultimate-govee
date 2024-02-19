import { Type } from '@nestjs/common';
import {
  Devices as IceMakerDevices,
  DeviceStates as IceMakerDeviceStates,
} from './ice-maker';
import { Device } from '../../device';
import { Purifier } from './purifier/purifier';
import { Humidifier } from './humidifier/humidifier';
import { IceMaker } from './ice-maker/ice-maker';
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
export { Purifier, Humidifier, IceMaker };

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

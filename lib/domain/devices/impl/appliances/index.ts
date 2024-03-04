import { DeviceStates as IceMakerDeviceStates } from './ice-maker';
import { Purifier } from './purifier/purifier';
import { Humidifier } from './humidifier/humidifier';
import { IceMaker } from './ice-maker/ice-maker';
import { DeviceStates as HumidifierDeviceStates } from './humidifier';
import { DeviceStates as PurifierDeviceStates } from './purifier';
import { IceMakerStatus } from './ice-maker/types';

export * from './appliances.factory';
export * from './appliances.module';
export { Purifier, Humidifier, IceMaker, IceMakerStatus };

export const DeviceStates: string[] = [
  ...IceMakerDeviceStates,
  ...HumidifierDeviceStates,
  ...PurifierDeviceStates,
];

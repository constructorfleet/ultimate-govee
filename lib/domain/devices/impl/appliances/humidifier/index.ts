import { Type } from '@nestjs/common';
import { HumidifierDevice, Humidifier } from './humidifier';
import { MistLevelStateName } from './humidifier.mist';
import {
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
} from './humidifier.modes';
import { TargetHumidityStateName } from './humidifier.target-humidity';
import { UVCStateName } from './humidifier.uvc';
import { Device } from '../../../device';

export const Devices: Type<Device>[] = [HumidifierDevice];
export {
  Humidifier,
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
  MistLevelStateName,
  UVCStateName,
};
export const DeviceStates: string[] = [
  MistLevelStateName,
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
  TargetHumidityStateName,
  UVCStateName,
];

import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { PurifierDevice } from './purifier';
import { FanSpeedStateName } from './purifier.fan-speed';
import { CustomModeStateName, ManualModeStateName } from './purifier.modes';
import { AutoModeStateName } from '../humidifier/humidifier.modes';

export const Devices: Type<Device>[] = [PurifierDevice];
export const DeviceStates: string[] = [
  FanSpeedStateName,
  ManualModeStateName,
  CustomModeStateName,
  AutoModeStateName,
];
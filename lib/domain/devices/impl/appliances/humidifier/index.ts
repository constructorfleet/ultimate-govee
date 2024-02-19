import { Type } from '@nestjs/common';
import { HumidifierDevice } from './humidifier';
import { MistLevelStateName } from './humidifier.mist';
import {
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
} from './humidifier.modes';
import { TargetHumidityStateName } from './humidifier.target-humidity';
import { UVCStateName } from './humidifier.uvc';
import { Device } from '../../../device';
import {
  ConnectedStateName,
  ControlLockStateName,
  HumidityStateName,
  ModeStateName,
  NightLightStateName,
  PowerStateName,
  TimerStateName,
  WaterShortageStateName,
} from '../../../states';

export const Devices: Type<Device>[] = [HumidifierDevice];
export type HumidifierStates = {
  [MistLevelStateName]: MistLevelStateName;
  [ManualModeStateName]: ManualModeStateName;
  [CustomModeStateName]: CustomModeStateName;
  [AutoModeStateName]: AutoModeStateName;
  [TargetHumidityStateName]: TargetHumidityStateName;
  [ModeStateName]: ModeStateName;
  [UVCStateName]: UVCStateName;
  [HumidityStateName]: HumidityStateName;
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
  [WaterShortageStateName]: WaterShortageStateName;
  [TimerStateName]: TimerStateName;
  [NightLightStateName]: NightLightStateName;
  [ControlLockStateName]: ControlLockStateName;
  [TimerStateName]: TimerStateName;
};
export const DeviceStates: string[] = [
  MistLevelStateName,
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
  TargetHumidityStateName,
  UVCStateName,
];

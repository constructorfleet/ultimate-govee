import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { PurifierDevice } from './purifier';
import { FanSpeedStateName } from './purifier.fan-speed';
import { CustomModeStateName, ManualModeStateName } from './purifier.modes';
import { AutoModeStateName } from '../humidifier/humidifier.modes';
import {
  ActiveStateName,
  ControlLockStateName,
  DisplayScheduleStateName,
  NightLightStateName,
  PowerStateName,
  TimerStateName,
} from '../../../states';
import { ConnectedStateName } from '../../../states/connected.state';

export const Devices: Type<Device>[] = [PurifierDevice];
export type PurifierStates = {
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
  [ActiveStateName]: ActiveStateName;
  [DisplayScheduleStateName]: DisplayScheduleStateName;
  [ManualModeStateName]: ManualModeStateName;
  [CustomModeStateName]: CustomModeStateName;
  [TimerStateName]: TimerStateName;
  [FanSpeedStateName]: FanSpeedStateName;
  [NightLightStateName]: NightLightStateName;
  [ControlLockStateName]: ControlLockStateName;
};
export const DeviceStates: string[] = [
  FanSpeedStateName,
  ManualModeStateName,
  CustomModeStateName,
  AutoModeStateName,
];

import { Purifier } from './purifier';
import { FanSpeedStateName } from './purifier.fan-speed';
import { CustomModeStateName, ManualModeStateName } from './purifier.modes';
import { AutoModeStateName } from '../humidifier/humidifier.modes';

export {
  Purifier,
  CustomModeStateName,
  ManualModeStateName,
  AutoModeStateName,
};
export const DeviceStates: string[] = [
  FanSpeedStateName,
  ManualModeStateName,
  CustomModeStateName,
  AutoModeStateName,
];

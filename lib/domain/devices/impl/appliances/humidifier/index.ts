import { Humidifier } from './humidifier';
import { MistLevelStateName } from './humidifier.mist';
import {
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
} from './humidifier.modes';
import { TargetHumidityStateName } from './humidifier.target-humidity';
import { UVCStateName } from './humidifier.uvc';

// export const Devices: Type<Device>[] = [HumidifierDevice];
export {
  Humidifier,
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
  MistLevelStateName,
  TargetHumidityStateName,
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

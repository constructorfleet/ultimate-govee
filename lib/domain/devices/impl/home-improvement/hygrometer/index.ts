import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { HygrometerDevice } from './hygrometer';
import {
  BatteryLevelStateName,
  ConnectedStateName,
  HumidityStateName,
  PowerStateName,
  TemperatureStateName,
} from '../../../states';

export const Devices: Type<Device>[] = [HygrometerDevice];
export type HygrometerStates = {
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
  [TemperatureStateName]: TemperatureStateName;
  [HumidityStateName]: HumidityStateName;
  [BatteryLevelStateName]: BatteryLevelStateName;
};
export const DeviceStates: string[] = [];

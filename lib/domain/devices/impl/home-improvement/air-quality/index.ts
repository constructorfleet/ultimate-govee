import { Type } from '@nestjs/common';
import { AirQualityDevice } from './air-quality';
import { Device } from '../../../device';
import { PM2StateName } from './air-quality.pm2';
import {
  ConnectedStateName,
  HumidityStateName,
  PowerStateName,
  TemperatureStateName,
} from '../../../states';

export const Devices: Type<Device>[] = [AirQualityDevice];
export type AirQualityStates = {
  [HumidityStateName]: HumidityStateName;
  [TemperatureStateName]: TemperatureStateName;
  [PM2StateName]: PM2StateName;
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
};
export const DeviceStates: string[] = [PM2StateName];

import { Type } from '@nestjs/common';
import { AirQualityDevice, AirQualitySensor } from './air-quality';
import { Device } from '../../../device';
import { PM2StateName } from './air-quality.pm2';

export const Devices: Type<Device>[] = [AirQualityDevice];
export { AirQualitySensor };
export const DeviceStates: string[] = [PM2StateName];

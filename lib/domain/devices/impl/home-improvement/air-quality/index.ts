import { Type } from '@nestjs/common';
import { AirQualityDevice, AirQualitySensor } from './air-quality';
import { Device } from '../../../device';
import { PM25StateName } from './air-quality.pm25';

export const Devices: Type<Device>[] = [AirQualityDevice];
export { AirQualitySensor };
export const DeviceStates: string[] = [PM25StateName];

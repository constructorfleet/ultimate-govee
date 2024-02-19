import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { HygrometerDevice } from './hygrometer';

export const Devices: Type<Device>[] = [HygrometerDevice];
export const DeviceStates: string[] = [];

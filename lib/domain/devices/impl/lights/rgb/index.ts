import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { RGBLightDevice } from './rgb-light';
import { SceneModeStateName } from './rgb-light.modes';

export const Devices: Type<Device>[] = [RGBLightDevice];
export const DeviceStates: string[] = [SceneModeStateName];

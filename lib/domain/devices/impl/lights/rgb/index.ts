import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { RGBLightDevice, RGBLight } from './rgb-light';
import { SceneModeStateName } from './rgb-light.modes';

export const Devices: Type<Device>[] = [RGBLightDevice];
export { RGBLight, SceneModeStateName };
export const DeviceStates: string[] = [SceneModeStateName];

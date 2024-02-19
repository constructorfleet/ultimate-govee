import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { RGBICLightDevice, RGBICLight } from './rgbic-light';
import {
  AdvancedColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
} from './rgbic-light.modes';

export const Devices: Type<Device>[] = [RGBICLightDevice];
export { RGBICLight };
export const DeviceStates: string[] = [
  WholeColorModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  MicModeStateName,
];

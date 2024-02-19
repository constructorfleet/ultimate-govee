import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { RGBICLightDevice } from './rgbic-light';
import {
  AdvancedColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
} from './rgbic-light.modes';
import {
  ActiveStateName,
  BrightnessStateName,
  ColorTempStateName,
  ConnectedStateName,
  LightEffectStateName,
  ModeStateName,
  PowerStateName,
  SegmentCountStateName,
} from '../../../states';

export const Devices: Type<Device>[] = [RGBICLightDevice];
export type RGBICLightStates = {
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
  [ActiveStateName]: ActiveStateName;
  [BrightnessStateName]: BrightnessStateName;
  [ColorTempStateName]: ColorTempStateName;
  [SegmentCountStateName]: SegmentCountStateName;
  [WholeColorModeStateName]: WholeColorModeStateName;
  [LightEffectStateName]: LightEffectStateName;
  [MicModeStateName]: MicModeStateName;
  [AdvancedColorModeStateName]: AdvancedColorModeStateName;
  [ModeStateName]: ModeStateName;
  [SegmentColorModeStateName]: SegmentColorModeStateName;
};
export const DeviceStates: string[] = [
  WholeColorModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  MicModeStateName,
];

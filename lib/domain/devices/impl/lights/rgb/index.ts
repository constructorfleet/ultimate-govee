import { Type } from '@nestjs/common';
import { Device } from '../../../device';
import { RGBLightDevice } from './rgb-light';
import { SceneModeStateName } from './rgb-light.modes';
import {
  ActiveStateName,
  BrightnessStateName,
  ColorRGBStateName,
  ColorTempStateName,
  ConnectedStateName,
  PowerStateName,
} from '../../../states';

export const Devices: Type<Device>[] = [RGBLightDevice];
export type RGBLightStates = {
  [PowerStateName]: PowerStateName;
  [ConnectedStateName]: ConnectedStateName;
  [BrightnessStateName]: BrightnessStateName;
  [ColorRGBStateName]: ColorRGBStateName;
  [ColorTempStateName]: ColorTempStateName;
  [SceneModeStateName]: SceneModeStateName;
  [ActiveStateName]: ActiveStateName;
};
export const DeviceStates: string[] = [SceneModeStateName];

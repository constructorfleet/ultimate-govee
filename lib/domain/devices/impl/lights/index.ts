import { DeviceStates as RGBLightDeviceStates } from './rgb';
import {
  DeviceStates as RGBICLightDeviceStates,
  DiyModeState,
  DiyModeStateName,
} from './rgbic';
import { RGBLight } from './rgb/rgb-light';
import { RGBICLight } from './rgbic/rgbic-light';
export * from './lights.factory';
export * from './lights.module';

export { RGBLight, RGBICLight, DiyModeState, DiyModeStateName };
export const DeviceStates: string[] = [
  ...RGBICLightDeviceStates,
  ...RGBLightDeviceStates,
];

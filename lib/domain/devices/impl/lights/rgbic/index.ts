import { RGBICLight } from './rgbic-light';
import {
  DiyModeStateName,
  DiyModeState,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
  RGBICActiveState,
  SceneModeState,
} from './rgbic-light.modes';

// export const Devices: Type<Device>[] = [RGBICLightDevice];
export {
  RGBICLight,
  WholeColorModeStateName,
  SegmentColorModeStateName,
  DiyModeStateName,
  DiyModeState,
  MicModeStateName,
  RGBICActiveState,
  SceneModeState,
};
export const DeviceStates: string[] = [
  WholeColorModeStateName,
  SegmentColorModeStateName,
  DiyModeStateName,
  MicModeStateName,
];

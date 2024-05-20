import { RGBICLight } from './rgbic-light';
import {
  DiyModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
} from './rgbic-light.modes';

// export const Devices: Type<Device>[] = [RGBICLightDevice];
export {
  RGBICLight,
  WholeColorModeStateName,
  SegmentColorModeStateName,
  DiyModeStateName,
  MicModeStateName,
};
export const DeviceStates: string[] = [
  WholeColorModeStateName,
  SegmentColorModeStateName,
  DiyModeStateName,
  MicModeStateName,
];

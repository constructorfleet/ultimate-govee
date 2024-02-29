import { RGBICLight } from './rgbic-light';
import {
  AdvancedColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
} from './rgbic-light.modes';

// export const Devices: Type<Device>[] = [RGBICLightDevice];
export {
  RGBICLight,
  WholeColorModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  MicModeStateName,
};
export const DeviceStates: string[] = [
  WholeColorModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  MicModeStateName,
];

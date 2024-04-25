import { DreamView, DreamViewDevice, DreamViewFactory } from './dreamview';

import {
  VideoModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
} from './dreamview.states';
export { DreamView, DreamViewDevice, DreamViewFactory };
export {
  VideoModeStateName,
  VideoModeState,
  MicModeStateName,
  MicModeState,
  SegmentColorModeStateName,
  SegmentColorModeState,
  SceneModeState,
} from './dreamview.states';
export const DeviceStates: string[] = [
  VideoModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
];

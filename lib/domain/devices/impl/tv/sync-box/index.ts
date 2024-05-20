import { SyncBox, SyncBoxDevice, SyncBoxFactory } from './sync-box';

import {
  VideoModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
} from './sync-box.states';
export { SyncBox, SyncBoxDevice, SyncBoxFactory };
export {
  VideoModeStateName,
  VideoModeState,
  MicModeStateName,
  MicModeState,
  SegmentColorModeStateName,
  SegmentColorModeState,
  SceneModeState,
} from './sync-box.states';
export const DeviceStates: string[] = [
  VideoModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
];

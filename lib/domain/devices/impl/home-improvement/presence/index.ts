import { PresenceSensor, PresenceDevice } from './presence';
import {
  BiologicalPresenceStateName,
  EnablePresenceStateName,
  MMWavePresenceStateName,
  DetectionSettingsStateName,
} from './presence.states';
export { PresenceSensor, PresenceDevice };
export {
  MMWavePresenceState,
  MMWavePresenceStateName,
  BiologicalPresenceStateName,
  BiologicalPresenceState,
  EnablePresenceStateName,
  EnablePresenceState,
  DetectionSettingsStateName,
  DetectionSettingsState,
} from './presence.states';
export const DeviceStates: string[] = [
  MMWavePresenceStateName,
  BiologicalPresenceStateName,
  EnablePresenceStateName,
  DetectionSettingsStateName,
];

import { DeviceStates as ApplianceStates } from './appliances';
import {
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
  MistLevelStateName,
  TargetHumidityStateName,
  UVCStateName,
} from './appliances/humidifier';
import { Humidifier } from './appliances/humidifier/humidifier';
import {
  BasketFullStateName,
  IceMakerStatusStateName,
  MakingIceStateName,
  NuggetSizeStateName,
  ScheduledStartStateName,
} from './appliances/ice-maker';
import { IceMaker } from './appliances/ice-maker/ice-maker';
import { Purifier } from './appliances/purifier/purifier';
import { DeviceStates as HomeImprovementStates } from './home-improvement';
import { PM25StateName } from './home-improvement/air-quality';
import { AirQualitySensor } from './home-improvement/air-quality/air-quality';
import { HygrometerSensor } from './home-improvement/hygrometer/hygrometer';
import { MeatThermometer } from './home-improvement/meat-thermometer';
import {
  MeatThermometerDevice,
  MeatThermometerSensor,
} from './home-improvement/meat-thermometer/meat-thermometer';
import { PresenceSensor } from './home-improvement/presence';
import {
  BiologicalPresenceStateName,
  DetectionSettingsStateName,
  EnablePresenceFlags,
  EnablePresenceStateName,
  MMWavePresenceStateName,
} from './home-improvement/presence/presence.states';
import { DeviceStates as LightStates } from './lights';
import { SceneModeStateName } from './lights/rgb';
import { RGBLight } from './lights/rgb/rgb-light';
import {
  DiyModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
} from './lights/rgbic';
import { RGBICLight } from './lights/rgbic/rgbic-light';
import { DreamView, DreamViewDevice } from './tv/dreamview/dreamview';
import { SyncBox, SyncBoxDevice } from './tv/sync-box/sync-box';
import { DiyModeState } from './lights/rgbic/rgbic-light.modes';
import {
  AmbiantState,
  AmbiantStateName,
} from './tv/dreamview/dreamview.states';
export { AppliancesFactory, AppliancesModule } from './appliances';
export {
  HomeImprovementFactory,
  HomeImprovementModule,
} from './home-improvement';
export { LightsFactory, LightsModule } from './lights';
export {
  AirQualitySensor,
  AutoModeStateName,
  BasketFullStateName,
  BiologicalPresenceStateName,
  CustomModeStateName,
  DetectionSettingsStateName,
  DiyModeStateName,
  DiyModeState,
  EnablePresenceFlags,
  EnablePresenceStateName,
  Humidifier,
  HygrometerSensor,
  IceMaker,
  IceMakerStatusStateName,
  MakingIceStateName,
  ManualModeStateName,
  MeatThermometer,
  MeatThermometerDevice,
  MeatThermometerSensor,
  MicModeStateName,
  MistLevelStateName,
  MMWavePresenceStateName,
  NuggetSizeStateName,
  PM25StateName,
  PresenceSensor,
  Purifier,
  RGBICLight,
  RGBLight,
  SceneModeStateName,
  ScheduledStartStateName,
  SegmentColorModeStateName,
  TargetHumidityStateName,
  UVCStateName,
  WholeColorModeStateName,
  AmbiantState,
  AmbiantStateName,
  DreamView,
  DreamViewDevice,
  SyncBox,
  SyncBoxDevice,
};
export const DeviceStates: string[] = [
  ...ApplianceStates,
  ...HomeImprovementStates,
  ...LightStates,
];

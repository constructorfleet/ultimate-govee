import { Type } from '@nestjs/common';
import {
  Devices as ApplicanceDevices,
  DeviceStates as ApplianceStates,
} from './appliances';
import {
  Devices as HomeImprovementDevices,
  DeviceStates as HomeImprovementStates,
} from './home-improvement';
import { Devices as LightDevices, DeviceStates as LightStates } from './lights';
import { Device } from '../device';
import { Humidifier } from './appliances/humidifier/humidifier';
import { Purifier } from './appliances/purifier/purifier';
import { IceMaker } from './appliances/ice-maker/ice-maker';
import { AirQualitySensor } from './home-improvement/air-quality/air-quality';
import { HygrometerSensor } from './home-improvement/hygrometer/hygrometer';
import { RGBLight } from './lights/rgb/rgb-light';
import { RGBICLight } from './lights/rgbic/rgbic-light';
import { PM25StateName } from './home-improvement/air-quality';
import {
  BasketFullStateName,
  IceMakerStatusStateName,
  MakingIceStateName,
  NuggetSizeStateName,
  ScheduledStartStateName,
} from './appliances/ice-maker';
import {
  AutoModeStateName,
  CustomModeStateName,
  ManualModeStateName,
  MistLevelStateName,
  UVCStateName,
} from './appliances/humidifier';
import { SceneModeStateName } from './lights/rgb';
import {
  AdvancedColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  WholeColorModeStateName,
} from './lights/rgbic';

export { AppliancesFactory, AppliancesModule } from './appliances';
export {
  HomeImprovementFactory,
  HomeImprovementModule,
} from './home-improvement';
export { LightsFactory, LightsModule } from './lights';

export const Devices: Type<Device>[] = [
  ...ApplicanceDevices,
  ...HomeImprovementDevices,
  ...LightDevices,
];
export {
  Humidifier,
  Purifier,
  IceMaker,
  AirQualitySensor,
  HygrometerSensor,
  RGBLight,
  RGBICLight,
};
export {
  PM25StateName,
  BasketFullStateName,
  NuggetSizeStateName,
  MakingIceStateName,
  IceMakerStatusStateName,
  ScheduledStartStateName,
  AutoModeStateName,
  ManualModeStateName,
  CustomModeStateName,
  MistLevelStateName,
  UVCStateName,
  SceneModeStateName,
  WholeColorModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  MicModeStateName,
};
export const DeviceStates: string[] = [
  ...ApplianceStates,
  ...HomeImprovementStates,
  ...LightStates,
];

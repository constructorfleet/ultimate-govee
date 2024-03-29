import * as cqrs from './cqrs';
import {
  AdvancedColorModeStateName,
  AutoModeStateName,
  BasketFullStateName,
  CustomModeStateName,
  IceMakerStatusStateName,
  DeviceStates as ImplStates,
  MakingIceStateName,
  ManualModeStateName,
  MicModeStateName,
  MistLevelStateName,
  NuggetSizeStateName,
  PM25StateName,
  SceneModeStateName,
  ScheduledStartStateName,
  SegmentColorModeStateName,
  TargetHumidityStateName,
  UVCStateName,
  WholeColorModeStateName,
} from './impl';
import { DeviceStates as CommonStates } from './states';
import { Humidifier } from './impl/appliances/humidifier/humidifier';
import {
  IceMaker,
  IceMakerStates,
} from './impl/appliances/ice-maker/ice-maker';
import { Purifier } from './impl/appliances/purifier/purifier';
import { AirQualitySensor } from './impl/home-improvement/air-quality/air-quality';
import { HygrometerSensor } from './impl/home-improvement/hygrometer/hygrometer';
import { RGBICLight } from './impl/lights/rgbic/rgbic-light';
import { RGBLight } from './impl/lights/rgb/rgb-light';
import { ActiveState, ActiveStateName } from './states/active.state';
import {
  BatteryLevelState,
  BatteryLevelStateName,
} from './states/battery-level.state';
import {
  BrightnessState,
  BrightnessStateName,
} from './states/brightness.state';
import { ColorRGBState, ColorRGBStateName } from './states/color-rgb.state';
import { ColorTempState, ColorTempStateName } from './states/color-temp.state';
import {
  ControlLockState,
  ControlLockStateName,
} from './states/control-lock.state';
import { DeviceState, DeviceOpState } from './states/device.state';
import {
  DisplayScheduleState,
  DisplayScheduleStateName,
} from './states/display-schedule.state';
import {
  FilterExpiredState,
  FilterExpiredStateName,
} from './states/filter-expired.state';
import {
  FilterLifeState,
  FilterLifeStateName,
} from './states/filter-life.state';
import { HumidityState, HumidityStateName } from './states';
import {
  LightEffectState,
  LightEffectStateName,
} from './states/light-effect.state';
import {
  NightLightState,
  NightLightStateName,
} from './states/night-light.state';
import { PowerState, PowerStateName } from './states/power.state';
import { IceMakerStatus, NuggetSize } from './impl/appliances/ice-maker/types';
import { LightEffect } from './states/light-effect.state';
import { UnknownState } from './states/unknown.state';
import {
  PresenceState,
  PresenceStateName,
  PresenceStateTypeName,
} from './states/presence.state';
import {
  MMWavePresenceState,
  MMWavePresenceStateName,
  BiologicalPresenceState,
  BiologicalPresenceStateName,
  EnablePresenceState,
  EnablePresenceStateName,
  DetectionSettingsStateName,
  DetectionSettingsState,
  PresenceSensor,
  EnablePresenceFlags,
} from './impl/home-improvement/presence';
import {
  TemperatureState,
  TemperatureStateName,
} from './states/temperature.state';
import {
  WaterShortageState,
  WaterShortageStateName,
} from './states/water-shortage.state';

export * from './devices.module';
export * from './devices.service';
export * from './devices.model';
export * from './states';
export * from './devices.types';
export {
  Humidifier,
  IceMaker,
  IceMakerStates,
  Purifier,
  AirQualitySensor,
  HygrometerSensor,
  RGBICLight,
  RGBLight,
  DeviceState,
  DeviceOpState,
  ActiveState,
  ActiveStateName,
  BatteryLevelState,
  BatteryLevelStateName,
  BrightnessState,
  BrightnessStateName,
  ColorRGBState,
  ColorRGBStateName,
  ColorTempState,
  ColorTempStateName,
  ControlLockState,
  ControlLockStateName,
  DisplayScheduleState,
  DisplayScheduleStateName,
  FilterExpiredState,
  FilterExpiredStateName,
  FilterLifeState,
  FilterLifeStateName,
  HumidityState,
  HumidityStateName,
  LightEffectState,
  LightEffectStateName,
  LightEffect,
  NightLightState,
  NightLightStateName,
  PowerState,
  PowerStateName,
  TemperatureState,
  TemperatureStateName,
  WaterShortageState,
  WaterShortageStateName,
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
  TargetHumidityStateName,
  UVCStateName,
  SceneModeStateName,
  WholeColorModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  MicModeStateName,
  IceMakerStatus,
  NuggetSize,
  PresenceSensor,
  UnknownState,
  PresenceState,
  PresenceStateTypeName,
  PresenceStateName,
  MMWavePresenceState,
  MMWavePresenceStateName,
  BiologicalPresenceStateName,
  BiologicalPresenceState,
  EnablePresenceState,
  EnablePresenceStateName,
  DetectionSettingsStateName,
  DetectionSettingsState,
  EnablePresenceFlags,
};

export const CQRS = cqrs;
export const DeviceStates: string[] = [...ImplStates, ...CommonStates].reduce(
  (acc, cur) => {
    if (!acc.includes(cur)) {
      acc.push(cur);
    }
    return acc;
  },
  [] as string[],
);

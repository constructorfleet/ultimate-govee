import { Type } from '@nestjs/common';
import * as cqrs from './cqrs';
import { Devices as ImplDevices, DeviceStates as ImplStates } from './impl';
import { Device } from './device';
import { DeviceStates as CommonStates } from './states';
import { Humidifier } from './impl/appliances/humidifier/humidifier';
import { IceMaker } from './impl/appliances/ice-maker/ice-maker';
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
import {
  SegmentCountState,
  SegmentCountStateName,
} from './states/segment-count.state';
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
export {
  Humidifier,
  IceMaker,
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
  NightLightState,
  NightLightStateName,
  PowerState,
  PowerStateName,
  SegmentCountState,
  SegmentCountStateName,
  TemperatureState,
  TemperatureStateName,
  WaterShortageState,
  WaterShortageStateName,
};

export const CQRS = cqrs;
export const Devices: Type<Device>[] = [...ImplDevices, Device];
export const DeviceStates: string[] = [...ImplStates, ...CommonStates].reduce(
  (acc, cur) => {
    if (!acc.includes(cur)) {
      acc.push(cur);
    }
    return acc;
  },
  [] as string[],
);

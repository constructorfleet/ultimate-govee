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
import { ActiveState } from './states/active.state';
import { BatteryLevelState } from './states/battery-level.state';
import { BrightnessState } from './states/brightness.state';
import { ColorRGBState } from './states/color-rgb.state';
import { ColorTempState } from './states/color-temp.state';
import { ControlLockState } from './states/control-lock.state';
import { DisplayScheduleState } from './states/display-schedule.state';
import { FilterState } from './states/filter.state';
import { HumidityState } from './impl/home-improvement/air-quality/air-quality.humidity';
import { LightEffectState } from './states/light-effect.state';
import { NightLightState } from './states/night-light.state';
import { PowerState } from './states/power.state';
import { SegmentCountState } from './states/segment-count.state';
import { TemperatureState } from './impl/home-improvement/air-quality/air-quality.temperature';
import { WaterShortageState } from './states/water-shortage.state';

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
  ActiveState,
  BatteryLevelState,
  BrightnessState,
  ColorRGBState,
  ColorTempState,
  ControlLockState,
  DisplayScheduleState,
  FilterState,
  HumidityState,
  LightEffectState,
  NightLightState,
  PowerState,
  SegmentCountState,
  TemperatureState,
  WaterShortageState,
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

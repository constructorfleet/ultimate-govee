import { ActiveStateName } from './active.state';
import { BatteryLevelStateName } from './battery-level.state';
import { BrightnessStateName } from './brightness.state';
import { ColorRGBStateName } from './color-rgb.state';
import { ColorTempStateName } from './color-temp.state';
import { ConnectedStateName } from './connected.state';
import { ControlLockStateName } from './control-lock.state';
import { DisplayScheduleStateName } from './display-schedule.state';
import { FilterStateName } from './filter.state';
import { HumidityStateName } from './humidity.state';
import { NightLightStateName } from './night-light.state';
import { PowerStateName } from './power.state';
import { SegmentCountStateName } from './segment-count.state';
import { TemperatureStateName } from './temperature.state';
import { TimerStateName } from './timer.state';
import { WaterShortageStateName } from './water-shortage.state';

export * from './active.state';
export * from './battery-level.state';
export * from './brightness.state';
export * from './color-rgb.state';
export * from './color-temp.state';
export * from './connected.state';
export * from './control-lock.state';
export * from './device.state';
export * from './display-schedule.state';
export * from './filter.state';
export * from './humidity.state';
export * from './light-effect.state';
export * from './mode.state';
export * from './night-light.state';
export * from './power.state';
export * from './segment-count.state';
export * from './temperature.state';
export * from './timer.state';
export * from './water-shortage.state';
export * from './numeric.state';

export const DeviceStates: string[] = [
  ActiveStateName,
  BatteryLevelStateName,
  BrightnessStateName,
  ColorRGBStateName,
  ColorTempStateName,
  ConnectedStateName,
  ControlLockStateName,
  DisplayScheduleStateName,
  FilterStateName,
  HumidityStateName,
  NightLightStateName,
  PowerStateName,
  SegmentCountStateName,
  TemperatureStateName,
  TimerStateName,
  WaterShortageStateName,
];
import { ActiveState } from './active.state';
import { BatteryLevelState } from './battery-level.state';
import { BrightnessState } from './brightness.state';
import { ColorRGBState } from './color-rgb.state';
import { ColorTempState } from './color-temp.state';
import { ConnectedState } from './connected.state';
import { ControlLockState } from './control-lock.state';
import { DisplayScheduleState } from './display-schedule.state';
import { FilterState } from './filter.state';
import { HumidityState } from './humidity.state';
import { LightEffectState } from './light-effect.state';
import { ModeState } from './mode.state';
import { NightLightState } from './night-light.state';
import { PowerState } from './power.state';
import { SegmentCountState } from './segment-count.state';
import { TemperatureState } from './temperature.state';
import { TimerState } from './timer.state';
import { WaterShortageState } from './water-shortage.state';

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

export const DeviceStates = [
  ActiveState,
  BatteryLevelState,
  BrightnessState,
  ColorRGBState,
  ColorTempState,
  ConnectedState,
  ControlLockState,
  DisplayScheduleState,
  FilterState,
  HumidityState,
  LightEffectState,
  ModeState,
  NightLightState,
  PowerState,
  SegmentCountState,
  TemperatureState,
  TimerState,
  WaterShortageState,
];

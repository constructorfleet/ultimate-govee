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
import { ConnectedState, ConnectedStateName } from './states/connected.state';
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
import { HumidityState, HumidityStateName } from './states/humidity.state';
import {
  LightEffectState,
  LightEffectStateName,
} from './states/light-effect.state';
import { ModeState, ModeStateName } from './states/mode.state';
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
import { TimerState, TimerStateName } from './states/timer.state';
import {
  WaterShortageState,
  WaterShortageStateName,
} from './states/water-shortage.state';
import {
  ControlLockState,
  ControlLockStateName,
} from './states/control-lock.state';
import { Optional } from '../../common/types';
import { Version } from './version.info';
import { DeviceState } from './states/device.state';

export type DeviceType<States extends DeviceStates = StandardDeviceStates> = {
  get name(): string;
  get id(): string;
  get model(): string;
  get goodsType(): number;
  get pactCode(): number;
  get pactType(): number;
  get iotTopic(): Optional<string>;
  get bleAddress(): Optional<string>;
  get version(): Version;
  get states(): States;
  currentStates(): DeviceStateValues<States>;
  logState(): void;
};

export type DeviceStates = {
  [StateName: string]: Optional<DeviceState<typeof StateName, any>>;
};

export type StandardDeviceStates = {
  [ActiveStateName]: Optional<ActiveState>;
  [BatteryLevelStateName]: Optional<BatteryLevelState>;
  [BrightnessStateName]: Optional<BrightnessState>;
  [ColorRGBStateName]: Optional<ColorRGBState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [ControlLockStateName]: Optional<ControlLockState>;
  [DisplayScheduleStateName]: Optional<DisplayScheduleState>;
  [FilterExpiredStateName]: Optional<FilterExpiredState>;
  [FilterLifeStateName]: Optional<FilterLifeState>;
  [HumidityStateName]: Optional<HumidityState>;
  [LightEffectStateName]: Optional<LightEffectState>;
  [ModeStateName]: Optional<ModeState>;
  [NightLightStateName]: Optional<NightLightState>;
  [PowerStateName]: Optional<PowerState>;
  [SegmentCountStateName]: Optional<SegmentCountState>;
  [TemperatureStateName]: Optional<TemperatureState>;
  [TimerStateName]: Optional<TimerState>;
  [WaterShortageStateName]: Optional<WaterShortageState>;
};

export type DeviceStateValues<States extends DeviceStates> = {
  [StateName in keyof States]: StateName extends ModeStateName
    ? Optional<string>
    : States[StateName] extends { value: infer U }
      ? U
      : undefined;
};

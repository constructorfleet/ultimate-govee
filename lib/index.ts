import 'module-alias/register';
import {
  BleChannelModuleOptions,
  AsyncBleChannelModuleOptions,
  IoTChannelModuleOptions,
  AsyncIoTChannelModuleOptions,
  Devices,
} from './domain';
export {
  BleChannelModuleOptions,
  AsyncBleChannelModuleOptions,
  IoTChannelModuleOptions,
  AsyncIoTChannelModuleOptions,
  PersistModuleOptions,
  AsyncPersistModuleOptions,
};
export * from './ultimate-govee.module';
export * from './ultimate-govee.service';
export * from './ultimate-govee.config';
export {
  Devices,
  DeviceStates,
  Humidifier,
  IceMaker,
  Purifier,
  AirQualitySensor,
  HygrometerSensor,
  RGBLight,
  RGBICLight,
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
  DeviceState,
  DeviceOpState,
  DisplayScheduleState,
  DisplayScheduleStateName,
  FilterState,
  FilterStateName,
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
} from './domain';
export { Device } from './domain/devices/device';
export {
  DeltaMap,
  DeltaSet,
  mapForEach,
  processElements,
  startDelta,
  filterDelta,
  mapDelta,
  tapDelta,
  processDelta,
} from './common';
import {
  ASYNC_OPTIONS_TYPE as AsyncPersistModuleOptions,
  OPTIONS_TYPE as PersistModuleOptions,
} from './persist';
export const DeviceTypes = Object.fromEntries(
  Devices.map((device) => [device.name, device]),
);

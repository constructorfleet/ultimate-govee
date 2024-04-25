import { AirQualitySensor } from './air-quality/air-quality';
import { HygrometerSensor } from './hygrometer/hygrometer';
import { DeviceStates as AirQualityDeviceStates } from './air-quality';
import { DeviceStates as HygrometerDeviceStates } from './hygrometer';
import { DeviceStates as PresenceSnsorStates } from './presence';
import { DeviceStates as MeatThermometerStates } from './meat-thermometer';
import { PresenceSensor } from './presence/presence';
import { MeatThermometerSensor } from './meat-thermometer/meat-thermometer';

export * from './home-improvement.factory';
export * from './home-improvement.module';
export {
  AirQualitySensor,
  HygrometerSensor,
  PresenceSensor,
  MeatThermometerSensor,
};

export const DeviceStates: string[] = [
  ...AirQualityDeviceStates,
  ...HygrometerDeviceStates,
  ...PresenceSnsorStates,
  ...MeatThermometerStates,
];

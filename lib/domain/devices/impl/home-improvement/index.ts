import { AirQualitySensor } from './air-quality/air-quality';
import { HygrometerSensor } from './hygrometer/hygrometer';
import { DeviceStates as AirQualityDeviceStates } from './air-quality';
import { DeviceStates as HygrometerDeviceStates } from './air-quality';

export * from './home-improvement.factory';
export * from './home-improvement.module';
export { AirQualitySensor, HygrometerSensor };

export const DeviceStates: string[] = [
  ...AirQualityDeviceStates,
  ...HygrometerDeviceStates,
];

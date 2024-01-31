import { Injectable } from '@nestjs/common';
import { DeviceModel } from '../../../devices.model';
import { DefaultFactory, Device, StateFactories } from '../../device';
import { DeviceFactory } from '../../device.factory';
import { PM2State } from './air-quality.pm2';
import { TemperatureState } from './air-quality.temperature';
import { HumidityState } from './air-quality.humidity';

const StateFactories: StateFactories = [
  {
    H5106: [
      (device: DeviceModel) => new TemperatureState(device),
      (device: DeviceModel) => new HumidityState(device),
      (device: DeviceModel) => new PM2State(device),
    ],
    [DefaultFactory]: [],
  },
];

export const AirQualityType: 'airQuality' = 'airQuality' as const;
export type AirQualityType = typeof AirQualityType;

export class AirQualityDevice extends Device {
  static readonly deviceType: AirQualityType = AirQualityType;

  constructor(deviceModel: DeviceModel) {
    super(deviceModel, StateFactories);
  }
}

@Injectable()
export class SensorFactory extends DeviceFactory<AirQualityDevice> {
  constructor() {
    super(AirQualityDevice, {
      'Home Improvement': {
        Temp: /Air Quality/i,
      },
    });
  }
}

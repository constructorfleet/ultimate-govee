import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel } from '../../../devices.model';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { PM2State } from './air-quality.pm2';
import { TemperatureState } from './air-quality.temperature';
import { HumidityState } from './air-quality.humidity';
import { ModuleDestroyObservable } from '@govee/common';

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

  constructor(
    deviceModel: DeviceModel,
    eventBus: EventBus,
    commandBus: CommandBus,
    moduleDestroyed$: ModuleDestroyObservable,
  ) {
    super(deviceModel, eventBus, commandBus, moduleDestroyed$, StateFactories);
  }
}

@Injectable()
export class AirQualityFactory extends DeviceFactory<AirQualityDevice> {
  constructor() {
    super(AirQualityDevice, {
      'Home Improvement': {
        Temp: /Air Quality/i,
      },
    });
  }
}

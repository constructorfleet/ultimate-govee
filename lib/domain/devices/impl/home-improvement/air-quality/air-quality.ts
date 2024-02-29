import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel } from '../../../devices.model';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { PM25State, PM25StateName } from './air-quality.pm25';
import { TemperatureState } from './air-quality.temperature';
import { HumidityState } from './air-quality.humidity';
import {
  ConnectedState,
  ConnectedStateName,
  DeviceOpState,
  HumidityStateName,
  PowerState,
  PowerStateName,
  TemperatureStateName,
} from '../../../states';
import { Optional } from '~ultimate-govee-common';

const StateFactories: StateFactories = [
  (device) => new PowerState(device),
  (device) => new ConnectedState(device),
  {
    H5106: [
      (device: DeviceModel) => new TemperatureState(device),
      (device: DeviceModel) => new HumidityState(device),
      (device: DeviceModel) => new PM25State(device),
    ],
    [DefaultFactory]: [],
  },
];

export const AirQualityType: 'airQuality' = 'airQuality' as const;
export type AirQualityType = typeof AirQualityType;

export class AirQualityDevice
  extends Device<AirQualitySensor>
  implements AirQualitySensor
{
  static readonly deviceType: AirQualityType = AirQualityType;
  get deviceType(): string {
    return AirQualityDevice.deviceType;
  }

  constructor(
    deviceModel: DeviceModel,
    eventBus: EventBus,
    commandBus: CommandBus,
  ) {
    super(deviceModel, eventBus, commandBus, StateFactories);
  }
  get [HumidityStateName](): Optional<HumidityState> {
    return this.state(HumidityStateName);
  }
  get [TemperatureStateName](): Optional<TemperatureState> {
    return this.state(TemperatureStateName);
  }
  get [PM25StateName](): Optional<
    DeviceOpState<PM25StateName, number | undefined>
  > {
    return this.state(PM25StateName);
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
}

@Injectable()
export class AirQualityFactory extends DeviceFactory<
  AirQualityDevice,
  AirQualitySensor
> {
  constructor() {
    super(AirQualityDevice, {
      'Home Improvement': {
        Temp: /Air Quality/i,
      },
    });
  }
}
export type AirQualitySensor = {
  [HumidityStateName]: Optional<HumidityState>;
  [TemperatureStateName]: Optional<TemperatureState>;
  [PM25StateName]: Optional<DeviceOpState<PM25StateName, Optional<number>>>;
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
};

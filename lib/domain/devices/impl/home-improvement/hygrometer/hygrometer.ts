import { DeviceModel } from '../../../devices.model';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import {
  BatteryLevelState,
  BatteryLevelStateName,
  ConnectedState,
  ConnectedStateName,
  HumidityState,
  HumidityStateName,
  PowerState,
  PowerStateName,
  TemperatureState,
  TemperatureStateName,
} from '../../../states';
import { DeviceFactory } from '../../../device.factory';
import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';

export const Hygrometer: 'Hygrometer' = 'Hygrometer' as const;
export type Hygrometer = typeof Hygrometer;

const stateFactories: StateFactories = [
  (device) => new PowerState(device),
  (device) => new ConnectedState(device),
  {
    [DefaultFactory]: [
      (device: DeviceModel) => new TemperatureState(device),
      (device: DeviceModel) => new HumidityState(device),
      (device: DeviceModel) => new BatteryLevelState(device),
    ],
  },
];

export class HygrometerDevice extends Device implements HygrometerSensor {
  static readonly deviceType: string = Hygrometer;
  get deviceType(): string {
    return HygrometerDevice.deviceType;
  }
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [TemperatureStateName](): Optional<TemperatureState> {
    return this.state(TemperatureStateName);
  }
  get [HumidityStateName](): Optional<HumidityState> {
    return this.state(HumidityStateName);
  }
  get [BatteryLevelStateName](): Optional<BatteryLevelState> {
    return this.state(BatteryLevelStateName);
  }
}

@Injectable()
export class HygrometerFactory extends DeviceFactory<HygrometerDevice> {
  constructor() {
    super(HygrometerDevice, {
      'Home Improvement': {
        Temp: /Hygrometer/i,
      },
    });
  }
}
export type HygrometerSensor = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [TemperatureStateName]: Optional<TemperatureState>;
  [HumidityStateName]: Optional<HumidityState>;
  [BatteryLevelStateName]: Optional<BatteryLevelState>;
};

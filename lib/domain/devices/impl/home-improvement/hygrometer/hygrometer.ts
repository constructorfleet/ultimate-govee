import { DeviceModel } from '@constructorfleet/ultimate-govee/domain/devices';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import {
  BatteryLevelState,
  ConnectedState,
  HumidityState,
  PowerState,
  TemperatureState,
} from '../../../states';
import { DeviceFactory } from '../../../device.factory';
import { Injectable } from '@nestjs/common';

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

export class HygrometerDevice extends Device {
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
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

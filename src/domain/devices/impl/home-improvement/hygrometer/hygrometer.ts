import { DeviceModel } from '@govee/domain/devices';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import {
  BatteryLevelState,
  HumidityState,
  TemperatureState,
} from '../../../states';
import { DeviceFactory } from '../../../device.factory';
import { Injectable } from '@nestjs/common';

export const Hygrometer: 'Hygrometer' = 'Hygrometer' as const;
export type Hygrometer = typeof Hygrometer;

const stateFactories: StateFactories = [
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

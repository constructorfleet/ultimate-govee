import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  BrightnessState,
  ColorRGBState,
  ConnectedState,
  PowerState,
} from '../../states';
import { DeviceModel } from '../../devices.model';
import { StateFactories } from '../../device';
import { DeviceFactory } from '../../device.factory';
import { LightDevice } from '../light.device';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new ColorRGBState(device),
];

export const RGBLightType: 'rgb' = 'rgb' as const;
export type RGBLightType = typeof RGBLightType;

export class RGBLightDevice extends LightDevice {
  static readonly type: RGBLightType = RGBLightType;

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactory);
  }
}

@Injectable()
export class RGBLightFactory extends DeviceFactory<RGBLightDevice> {
  constructor() {
    super(RGBLightDevice, {
      'LED Strip Light': {
        'RGB Strip Lights': true,
      },
      'Indoor Lighting': {
        'Table Lamps': / RGB /,
      },
    });
  }
}

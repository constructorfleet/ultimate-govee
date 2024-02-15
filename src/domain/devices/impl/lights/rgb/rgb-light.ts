import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  BrightnessState,
  ColorRGBState,
  ConnectedState,
  PowerState,
  ColorTempState,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { LightDevice } from '../light.device';
import { ModuleDestroyObservable } from '@govee/common';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new ColorRGBState(device),
  (device: DeviceModel) => new ColorTempState(device),
];

export const RGBLightType: 'rgb' = 'rgb' as const;
export type RGBLightType = typeof RGBLightType;

export class RGBLightDevice extends LightDevice {
  static readonly type: RGBLightType = RGBLightType;

  constructor(
    device: DeviceModel,
    eventBus: EventBus,
    commandBus: CommandBus,
    moduleDestroyed$: ModuleDestroyObservable,
  ) {
    super(device, eventBus, commandBus, moduleDestroyed$, StateFactory);
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

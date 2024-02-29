import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  BrightnessState,
  ColorRGBState,
  ConnectedState,
  PowerState,
  ColorTempState,
  ActiveState,
  ActiveStateName,
  BrightnessStateName,
  ColorRGBStateName,
  ColorTempStateName,
  ConnectedStateName,
  PowerStateName,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { LightDevice } from '../light.device';
import { SceneModeState, SceneModeStateName } from './rgb-light.modes';
import { Optional } from '../../../../../common/types';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new ActiveState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new ColorRGBState(device),
  (device: DeviceModel) => new ColorTempState(device),
];

export const RGBLightType: 'rgb' = 'rgb' as const;
export type RGBLightType = typeof RGBLightType;

export class RGBLightDevice extends LightDevice<RGBLight> implements RGBLight {
  static readonly deviceType: RGBLightType = RGBLightType;
  get deviceType(): string {
    return RGBLightDevice.deviceType;
  }

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactory);
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [BrightnessStateName](): Optional<BrightnessState> {
    return this.state(BrightnessStateName);
  }
  get [ColorRGBStateName](): Optional<ColorRGBState> {
    return this.state(ColorRGBStateName);
  }
  get [ColorTempStateName](): Optional<ColorTempState> {
    return this.state(ColorTempStateName);
  }
  get [SceneModeStateName](): Optional<SceneModeState> {
    return this.state(SceneModeStateName);
  }
  get [ActiveStateName](): Optional<ActiveState> {
    return this.state(ActiveStateName);
  }
}

@Injectable()
export class RGBLightFactory extends DeviceFactory<RGBLightDevice, RGBLight> {
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
export type RGBLight = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [BrightnessStateName]: Optional<BrightnessState>;
  [ColorRGBStateName]: Optional<ColorRGBState>;
  [ColorTempStateName]: Optional<ColorTempState>;
  [SceneModeStateName]: Optional<SceneModeState>;
  [ActiveStateName]: Optional<ActiveState>;
};

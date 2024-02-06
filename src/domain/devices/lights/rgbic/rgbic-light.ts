import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { StateFactories } from '../../device';
import {
  BrightnessState,
  ConnectedState,
  LightEffectStateName,
  PowerState,
  SegmentCountState,
  SegmentCountStateName,
} from '../../states';
import { DeviceModel } from '../../devices.model';
import {
  SegmentColorModeState,
  ColorModeState,
  MicModeState,
  RGBICActiveState,
  WholeColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  SceneModeState,
  AdvancedColorModeState,
} from './rgbic-light.modes';
import { DeviceFactory } from '../../device.factory';
import { LightDevice } from '../light.device';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new SegmentCountState(device),
  (device: DeviceModel) => new ColorModeState(device),
  (device: DeviceModel) => new SceneModeState(device),
  (device: DeviceModel) => new MicModeState(device),
  (device: DeviceModel) => new AdvancedColorModeState(device),
];

export const RGBICLightType: 'rgbic' = 'rgbic' as const;
export type RGBICLightType = typeof RGBICLightType;

export class RGBICLightDevice extends LightDevice {
  static readonly type = RGBICLightType;

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactory);
    this.addState(
      new SegmentColorModeState(
        device,
        this.state<SegmentCountState>(SegmentCountStateName)!,
      ),
    );
    this.addState(
      new RGBICActiveState(device, [
        this.state(WholeColorModeStateName),
        this.state(MicModeStateName),
        this.state(SegmentColorModeStateName),
        this.state(AdvancedColorModeStateName),
        this.state(LightEffectStateName),
      ]),
    );
  }
}

@Injectable()
export class RGBICLightFactory extends DeviceFactory<RGBICLightDevice> {
  constructor() {
    super(RGBICLightDevice, {
      'LED Strip Light': {
        'RGBIC Strip Lights': [/2\*10m RGBIC Strip Light.*/, /.*RGBIC.*/],
      },
    });
  }
}

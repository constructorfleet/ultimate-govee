import { Injectable } from '@nestjs/common';
import { Device, StateFactories } from '../../device';
import {
  BrightnessState,
  ConnectedState,
  PowerState,
  SegmentCountState,
  SegmentCountStateName,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import {
  SegmentColorModeState,
  ColorModeState,
  MicModeState,
  RGBICActiveState,
  WholeColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  SceneModeStateName,
  AdvancedColorModeStateName,
} from './rgbic-light.modes';
import { DeviceFactory } from '../../device.factory';
import { RGBICSegmentsState } from './rgbic-light.segments';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new SegmentCountState(device),
  (device: DeviceModel) => new ColorModeState(device),
  (device: DeviceModel) => new MicModeState(device),
];

export const RGBICLightType: 'rgbic' = 'rgbic' as const;
export type RGBICLightType = typeof RGBICLightType;

export class RGBICLightDevice extends Device {
  static readonly type = RGBICLightType;

  constructor(device: DeviceModel) {
    super(device, StateFactory);
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
        this.state(SceneModeStateName),
        this.state(AdvancedColorModeStateName),
      ]),
    );
    this.addState(new RGBICSegmentsState(device, this));
  }
}

@Injectable()
export class RGBICLightFactory extends DeviceFactory<RGBICLightDevice> {
  constructor() {
    super(RGBICLightDevice, {
      'LED Strip Light': {
        'RGBIC Strip Lights': true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import {
  BrightnessState,
  ColorRGBState,
  ConnectedState,
  PowerState,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { DeviceType, StateFactories } from '../../device-type';
import { DeviceTypeFactory } from '../../device-type.factory';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new ColorRGBState(device),
];

export const RGBLightType: 'rgb' = 'rgb' as const;
export type RGBLightType = typeof RGBLightType;

export class RGBLight extends DeviceType {
  static readonly type: RGBLightType = RGBLightType;

  constructor(device: DeviceModel) {
    super(device, StateFactory);
  }
}

@Injectable()
export class RGBLightFactory extends DeviceTypeFactory<RGBLight> {
  constructor() {
    super(RGBLight, {
      'LED Strip Light': {
        'RGB Strip Lights': true,
      },
      'Indoor Lighting': {
        'Table Lamps': / RGB /,
      },
    });
  }
}

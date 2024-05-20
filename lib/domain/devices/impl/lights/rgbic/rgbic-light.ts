import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { StateFactories } from '../../../device';
import {
  BrightnessState,
  ConnectedState,
  LightEffectStateName,
  PowerState,
  ColorTempState,
  ActiveState,
  ActiveStateName,
  BrightnessStateName,
  ColorTempStateName,
  ConnectedStateName,
  ModeStateName,
  PowerStateName,
  LightEffectState,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import {
  SegmentColorModeState,
  ColorModeState,
  MicModeState,
  RGBICActiveState,
  WholeColorModeStateName,
  SegmentColorModeStateName,
  SceneModeState,
  DiyModeState,
  DiyModeStateName,
} from './rgbic-light.modes';
import { DeviceFactory } from '../../../device.factory';
import { LightDevice } from '../light.device';
import { Optional } from '../../../../../common/types';
import { MicModeStateName } from './rgbic-light.modes';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new ActiveState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new ColorTempState(device),
  (device: DeviceModel) => new ColorModeState(device),
  (device: DeviceModel) => new SceneModeState(device),
  (device: DeviceModel) => new MicModeState(device),
  (device: DeviceModel) => new DiyModeState(device),
];

export const RGBICLightType: 'rgbic' = 'rgbic' as const;
export type RGBICLightType = typeof RGBICLightType;

export class RGBICLightDevice
  extends LightDevice<RGBICLight>
  implements RGBICLight
{
  static readonly deviceType = RGBICLightType;
  get deviceType(): string {
    return RGBICLightDevice.deviceType;
  }

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactory);
    this.addState(
      new RGBICActiveState(device, [
        this.state(WholeColorModeStateName),
        this.state(MicModeStateName),
        this.state(SegmentColorModeStateName),
        this.state(DiyModeStateName),
        this.state(LightEffectStateName),
      ]),
    );
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [ActiveStateName](): Optional<ActiveState> {
    return this.state(ActiveStateName);
  }
  get [BrightnessStateName](): Optional<BrightnessState> {
    return this.state(BrightnessStateName);
  }
  get [ColorTempStateName](): Optional<ColorTempState> {
    return this.state(ColorTempStateName);
  }
  get [WholeColorModeStateName](): Optional<ColorModeState> {
    return this.state(WholeColorModeStateName);
  }
  get [LightEffectStateName](): Optional<LightEffectState> {
    return this.state(LightEffectStateName);
  }
  get [MicModeStateName](): Optional<MicModeState> {
    return this.state(MicModeStateName);
  }
  get [DiyModeStateName](): Optional<DiyModeState> {
    return this.state(DiyModeStateName);
  }
  get [ModeStateName](): Optional<RGBICActiveState> {
    return this.state(ModeStateName);
  }
  get [SegmentColorModeStateName](): Optional<SegmentColorModeState> {
    return this.state(SegmentColorModeStateName);
  }
}

@Injectable()
export class RGBICLightFactory extends DeviceFactory<
  RGBICLightDevice,
  RGBICLight
> {
  constructor() {
    super(RGBICLightDevice, {
      'LED Strip Light': {
        'RGBIC Strip Lights': [/.*rgbic strip light.*/i, /.*rgbic.*/i],
      },
      'Indoor Lighting': {
        'Floor Lamps': [/.*rgbic strip light.*/i, /.*rgbic.*/i],
        'Wall Lamps': [/.*glide.*/i],
      },
      'Outdoor Lighting': {
        'Strip Lights': [/.*phantasy.*/i, /.*rgbic.*/i],
        'String Lights': [/.*rgbic.*/i],
      },
      'Other Lights': {
        'Car Lights': [/.*rgbic.*/i],
      },
    });
  }
}
export type RGBICLight = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [ActiveStateName]: Optional<ActiveState>;
  [BrightnessStateName]: Optional<BrightnessState>;
  [ColorTempStateName]: Optional<ColorTempState>;
  [WholeColorModeStateName]: Optional<ColorModeState>;
  [LightEffectStateName]: Optional<LightEffectState>;
  [MicModeStateName]: Optional<MicModeState>;
  [DiyModeStateName]: Optional<DiyModeState>;
  [ModeStateName]: Optional<RGBICActiveState>;
  [SegmentColorModeStateName]: Optional<SegmentColorModeState>;
};

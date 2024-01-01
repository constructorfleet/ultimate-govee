import { Injectable } from '@nestjs/common';
import {
  ConnectedState,
  ControlLockState,
  DisplayScheduleState,
  HumidityState,
  NightLightState,
  PowerState,
  TimerState,
  WaterShortageState,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { DeviceType, StateFactories, StateFactory } from '../../device-type';
import { TargetHumidityState } from './humidifier.target-humidity';
import { MistLevelState } from './humidifier.mist';
import {
  AutoModeState,
  AutoModeStateName,
  CustomModeState,
  CustomModeStateName,
  HumidifierActiveState,
  ManualModeState,
  ManualModeStateName,
} from './humidifier.modes';
import { DeviceTypeFactory } from '../../device-type.factory';
import { HumidiferUVCState } from './humidifier.uvc';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new WaterShortageState(device),
  (device: DeviceModel) => new TimerState(device),
  (device: DeviceModel) => new ManualModeState(device),
  (device: DeviceModel) => new CustomModeState(device),
  {
    H7141: [
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x18),
      (device: DeviceModel) => new ControlLockState(device),
    ],
    H7142: [
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x1b),
      (device: DeviceModel) => new DisplayScheduleState(device, 0xaa, 0x18),
      (device: DeviceModel) => new HumidiferUVCState(device),
      (device: DeviceModel) => new AutoModeState(device),
      (device: DeviceModel) => new HumidityState(device),
    ],
  },
];

export const HumidifierType: 'humidifer' = 'humidifer' as const;
export type HumidifierType = typeof HumidifierType;

export class HumidifierDevice extends DeviceType {
  static readonly deviceType: HumidifierType = HumidifierType;

  constructor(device: DeviceModel) {
    super(device, StateFactory);
    const activeState = new HumidifierActiveState(device, [
      this.state(ManualModeStateName),
      this.state(CustomModeStateName),
      this.state(AutoModeStateName),
    ]);
    this.addState(activeState);
    this.addState(new MistLevelState(device, activeState));
    this.addState(new TargetHumidityState(device, activeState));
  }
}

@Injectable()
export class HumidifierFactory extends DeviceTypeFactory<HumidifierDevice> {
  constructor() {
    super(HumidifierDevice, {
      'Home Appliances': {
        'Air Treatment': /Humidifier/,
      },
    });
  }
}

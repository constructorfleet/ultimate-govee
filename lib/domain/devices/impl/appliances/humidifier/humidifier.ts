import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  ActiveState,
  ConnectedState,
  ControlLockState,
  DisplayScheduleState,
  HumidityState,
  HumidityStateName,
  NightLightState,
  PowerState,
  TimerState,
  WaterShortageState,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { Device, StateFactories } from '../../../device';
import { TargetHumidityState } from './humidifier.target-humidity';
import { MistLevelState } from './humidifier.mist';
import {
  AutoModeState,
  CustomModeState,
  CustomModeStateName,
  HumidifierActiveState,
  ManualModeState,
  ManualModeStateName,
} from './humidifier.modes';
import { DeviceFactory } from '../../../device.factory';
import { HumidiferUVCState } from './humidifier.uvc';

const StateFactories: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new ActiveState(device),
  (device: DeviceModel) => new WaterShortageState(device),
  (device: DeviceModel) => new TimerState(device, 0x0a, 0x0b),
  (device: DeviceModel) => new ManualModeState(device),
  (device: DeviceModel) => new CustomModeState(device),
  {
    H7141: [
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x18),
      (device: DeviceModel) => new ControlLockState(device, 0xaa, 0x0a),
    ],
    H7142: [
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x1b),
      (device: DeviceModel) => new DisplayScheduleState(device, 0xaa, 0x18),
      (device: DeviceModel) => new HumidiferUVCState(device),
      (device: DeviceModel) => new HumidityState(device),
    ],
  },
];

export const HumidifierType: 'humidifer' = 'humidifer' as const;
export type HumidifierType = typeof HumidifierType;

export class HumidifierDevice extends Device {
  static readonly deviceType: HumidifierType = HumidifierType;

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactories);
    const autoModeState = this.addState(
      new AutoModeState(device, this.state<HumidityState>(HumidityStateName)),
    );
    const activeState = new HumidifierActiveState(device, [
      this.state(ManualModeStateName),
      this.state(CustomModeStateName),
      autoModeState,
    ]);
    this.addState(activeState);
    this.addState(new MistLevelState(device, activeState));
    this.addState(new TargetHumidityState(device, activeState));
  }
}

@Injectable()
export class HumidifierFactory extends DeviceFactory<HumidifierDevice> {
  constructor() {
    super(HumidifierDevice, {
      'Home Appliances': {
        'Air Treatment': /Humidifier/,
      },
    });
  }
}

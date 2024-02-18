import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel } from '../../../devices.model';
import {
  ConnectedState,
  ControlLockState,
  DisplayScheduleState,
  NightLightState,
  PowerState,
  TimerState,
} from '../../../states';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { FanSpeedStateName, PurifierFanSpeedState } from './purifier.fan-speed';
import {
  CustomModeState,
  CustomModeStateName,
  ManualModeState,
  ManualModeStateName,
  PurifierActiveMode,
} from './purifier.modes';

const StateFactories: StateFactories = [
  (device) => new PowerState(device),
  (device) => new ConnectedState(device),
  (device: DeviceModel) => new DisplayScheduleState(device, 0xaa, 0x16),
  {
    H7126: [
      (device: DeviceModel) => new ManualModeState(device),
      (device: DeviceModel) => new CustomModeState(device),
      (device: DeviceModel) => new TimerState(device, 0xaa, 0x26),
    ],
    [DefaultFactory]: [
      (device: DeviceModel) => new PurifierFanSpeedState(device),
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x18),
      (device: DeviceModel) => new TimerState(device, 0xaa, 0x11),
      (device: DeviceModel) => new ControlLockState(device, 0xaa, 0x10),
    ],
  },
];

export const PurifierType: 'purifier' = 'purifier' as const;
export type PurifierType = typeof PurifierType;

export class PurifierDevice extends Device {
  static readonly deviceType: PurifierType = PurifierType;

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactories);
    const fanSpeedState = this.state<PurifierFanSpeedState>(FanSpeedStateName);
    if (!fanSpeedState) {
      const active = new PurifierActiveMode(device, [
        this.state(ManualModeStateName),
        this.state(CustomModeStateName),
      ]);
      this.addState(active);
      this.addState(new PurifierFanSpeedState(device, active));
    }
  }
}

@Injectable()
export class PurifierFactory extends DeviceFactory<PurifierDevice> {
  constructor() {
    super(PurifierDevice, {
      'Home Appliances': {
        'Air Treatment': /Purifier/,
      },
    });
  }
}
